from django.contrib.auth.models import User
from django.test import TestCase

from portfolios.models import Profile


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
