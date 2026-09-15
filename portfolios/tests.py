from django.contrib.auth.models import User
from django.test import TestCase

from portfolios.models import AgentNFCCard, AgentProfile, Profile
from portfolios.models import NFCCard


class VCardEndpointTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='secure-password',
        )
        self.profile = Profile.objects.create(
            user=self.user,
            slug='alice-portfolio',
            full_name='Alice Example',
            headline='Product Designer',
            email='alice@example.com',
            phone='+15551234567',
            avatar_url='https://example.com/avatar.jpg',
            social_links={
                'website': 'https://example.com',
                'linkedin': 'https://linkedin.com/in/alice',
                'organization': 'Northwind Labs',
            },
        )

    def test_vcard_download_headers_and_content(self):
        response = self.client.get('/api/vcard/alice-portfolio/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/vcard; charset=utf-8')
        self.assertEqual(
            response['Content-Disposition'],
            'attachment; filename="alice-portfolio.vcf"',
        )

        content = response.content.decode('utf-8')
        self.assertIn('BEGIN:VCARD', content)
        self.assertIn('VERSION:3.0', content)
        self.assertIn('FN:Alice Example', content)
        self.assertIn('ORG:Northwind Labs', content)
        self.assertIn('TITLE:Product Designer', content)
        self.assertIn('TEL:+15551234567', content)
        self.assertIn('EMAIL:alice@example.com', content)
        self.assertIn('URL:https://example.com', content)


class AgentResolverEndpointTests(TestCase):
    def setUp(self):
        self.agent = AgentProfile.objects.create(
            agent_id='AG-8821',
            slug='alice-agent',
            full_name='Alice Example',
            phone='+15551234567',
            email='alice@example.com',
            referral_code='ALICE8821',
            services_offered=['Airtime', 'Bill payments'],
        )
        self.card = AgentNFCCard.objects.create(agent=self.agent)

    def test_active_card_resolves_agent_profile(self):
        response = self.client.get(f'/api/v1/agent/{self.card.card_token}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['agent_id'], 'AG-8821')
        self.assertEqual(
            response.json()['app_download_url'],
            'https://sasapay.app/join?agent=ALICE8821',
        )

    def test_locked_card_is_forbidden_before_profile_fallback(self):
        self.card.status = AgentNFCCard.STATUS_LOCKED
        self.card.save(update_fields=['status'])

        response = self.client.get(f'/api/v1/agent/{self.card.card_token}/')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json(),
            {'error': 'This card has been reported lost or deactivated.'},
        )

    def test_unlinked_card_is_not_found(self):
        self.card.status = AgentNFCCard.STATUS_UNLINKED
        self.card.save(update_fields=['status'])

        response = self.client.get(f'/api/v1/agent/{self.card.card_token}/')

        self.assertEqual(response.status_code, 404)

    def test_null_agent_card_is_not_found(self):
        self.card.agent = None
        self.card.save(update_fields=['agent'])

        response = self.client.get(f'/api/v1/agent/{self.card.card_token}/')

        self.assertEqual(response.status_code, 404)

    def test_slug_and_agent_id_fallbacks_resolve_profile(self):
        for identifier in ('alice-agent', 'AG-8821'):
            with self.subTest(identifier=identifier):
                response = self.client.get(f'/api/v1/agent/{identifier}/')

                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()['slug'], 'alice-agent')


class CredentialResolverEndpointTests(TestCase):
    def setUp(self):
        self.agent = AgentProfile.objects.create(
            agent_id='AG-300',
            slug='kimani-allan',
            full_name='Kimani Allan',
            phone='+254758288727',
            email='kimania271@gmail.com',
            headline='SasaPay Authorized Agent',
            services_offered=['Cash In', 'Cash Out'],
        )
        self.card = NFCCard.objects.create(agent_profile=self.agent)

    def test_active_card_returns_credential_and_public_agent(self):
        with self.assertNumQueries(1):
            response = self.client.get(f'/api/v1/credentials/{self.card.card_token}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'success')
        self.assertEqual(
            response.json()['data'],
            {
                'card_token': str(self.card.card_token),
                'referral_code': 'AG-300',
                'is_active': True,
                'created_at': self.card.assigned_at.isoformat().replace('+00:00', 'Z'),
                'agent': {
                    'agent_id': 'AG-300',
                    'full_name': 'Kimani Allan',
                    'phone': '+254758288727',
                    'email': 'kimania271@gmail.com',
                    'headline': 'SasaPay Authorized Agent',
                    'services_offered': ['Cash In', 'Cash Out'],
                },
            },
        )

    def test_inactive_card_returns_not_found(self):
        self.card.status = NFCCard.STATUS_CHOICES[1][0]
        self.card.save(update_fields=['status'])

        response = self.client.get(f'/api/v1/credentials/{self.card.card_token}/')

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {'detail': 'Not found.'})


class AgentCreateEndpointTests(TestCase):
    def test_create_agent_returns_profile_and_download_url(self):
        response = self.client.post(
            '/api/v1/agent/create/',
            data={
                'agent_id': 'AG-9001',
                'slug': 'new-agent',
                'full_name': 'New Agent',
                'phone': '+254700000001',
                'email': 'new-agent@example.com',
                'referral_code': 'NEW9001',
                'services_offered': ['Cash in', 'Cash out'],
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['headline'], 'SasaPay Authorized Agent')
        self.assertEqual(
            response.json()['app_download_url'],
            'https://sasapay.app/join?agent=NEW9001',
        )
        self.assertTrue(AgentProfile.objects.filter(agent_id='AG-9001').exists())


class AgentRegistrationEndpointTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='supervisor',
            password='secure-password',
        )

    def test_registration_returns_validation_errors_without_required_fields(self):
        response = self.client.post('/api/v1/agent/register/', {}, content_type='application/json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('agent_id', response.json())

    def test_authenticated_registration_binds_card_and_returns_payload_url(self):
        self.client.force_login(self.user)

        response = self.client.post(
            '/api/v1/agent/register/',
            data={
                'agent_id': 'AG-9100',
                'full_name': 'Allan Kimani',
                'phone': '+254700000010',
                'email': 'allan@example.com',
                'services_offered': ['Cash in'],
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['slug'], 'allan-kimani')
        self.assertEqual(response.json()['referral_code'], 'AG-9100')
        card_token = response.json()['card_token']
        self.assertEqual(len(card_token), 32)
        nfc_card = NFCCard.objects.get(agent_profile__agent_id='AG-9100')
        self.assertEqual(
            response.json()['nfc_payload_url'],
            f'https://vibe-tap-one.vercel.app/c/{nfc_card.card_token}',
        )
        self.assertTrue(
            NFCCard.objects.filter(
                card_token=card_token,
                agent_profile__agent_id='AG-9100',
                status='ACTIVE',
            ).exists()
        )

    def test_duplicate_agent_id_returns_structured_error(self):
        AgentProfile.objects.create(
            agent_id='AG-9200',
            slug='existing-agent',
            full_name='Existing Agent',
            phone='+254700000020',
            email='existing@example.com',
            referral_code='EXISTING9200',
        )
        self.client.force_login(self.user)

        response = self.client.post(
            '/api/v1/agent/register/',
            data={
                'agent_id': 'AG-9200',
                'full_name': 'Another Agent',
                'phone': '+254700000021',
                'email': 'another@example.com',
                'referral_code': 'ANOTHER9200',
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('agent_id', response.json())
