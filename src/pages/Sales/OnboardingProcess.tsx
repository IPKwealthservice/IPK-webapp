import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import ComponentCard from "@/components/common/ComponentCard";

export default function OnboardingProcess() {
  return (
    <>
      <PageMeta title="Onboarding Process" description="Lead onboarding process" />
      <PageBreadcrumb
        pageTitle="Onboarding Process"
        items={[{ label: "Lead Management", href: "/sales/stages" }]}
      />
      <ComponentCard title="Onboarding">
        <div className="flex items-center justify-center py-8">
          <p className="text-base font-semibold text-gray-700 dark:text-white/80">
            Onboarding page
          </p>
        </div>
      </ComponentCard>
    </>
  );
}
