import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const filePath = join(process.cwd(), 'apps/web/app/dashboard-redesign/page.tsx');
  const fileContent = readFileSync(filePath, 'utf-8');

  return new Response(fileContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="contractor-dashboard.tsx"',
    },
  });
}
