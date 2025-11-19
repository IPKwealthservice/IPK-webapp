import { memo } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = memo(function PageMeta({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
});

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
