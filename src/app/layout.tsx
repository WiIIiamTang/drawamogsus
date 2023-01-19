import "./globals.css";
import VAnalytics from "@/components/Analytics";
import FleetWrapper from "@/components/FleetWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="pastel">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        {/** @ts-expect-error  https://github.com/vercel/next.js/issues/42292 */}
        <FleetWrapper>
          <div>{children}</div>
        </FleetWrapper>
        <VAnalytics />
      </body>
    </html>
  );
}
