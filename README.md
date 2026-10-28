# Krishna Kumar Verma — Mobile Engineering Portfolio

A responsive, static portfolio highlighting mobile engineering, architecture, and AI-connected systems.

## Run locally

Open `index.html` in a browser, or serve this directory with any static HTTP server.

## Deployment

This is a static HTML/CSS/JavaScript site. The intended production host is Vercel. Once the Git repository is linked to the Vercel project, pushes to the production branch can trigger deployments automatically.

## Profile links

- GitHub: https://github.com/krishna18787
- LinkedIn: https://www.linkedin.com/in/krishna-kumar-verma/

## Note

The project cards are illustrative architecture concepts, not claims about specific client deliveries. Replace them with verified projects and outcomes before presenting them as case studies. The contact form is a front-end demo and does not send or store messages.

## Contact form email delivery

The contact form posts to `/api/contact`. The Vercel serverless function sends a formatted email through Resend to `krishna18787@gmail.com`, with the visitor's email set as Reply-To.

Configure these environment variables in Vercel (Project Settings → Environment Variables):

- `RESEND_API_KEY` — required; create a key in your Resend dashboard. Never commit this secret to GitHub.
- `RESEND_FROM_EMAIL` — optional; use a sender address on a domain verified in Resend. For initial testing, the function defaults to Resend's `onboarding@resend.dev` sender, which has provider restrictions.

After adding or changing environment variables, redeploy the project. The API route returns a friendly error until `RESEND_API_KEY` is configured.
