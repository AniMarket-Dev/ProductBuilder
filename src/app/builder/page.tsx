import { ConstructorApp } from "@/components/constructor/constructor-app";
import { parseInteger } from "@/lib/utils";

type ConstructorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConstructorPage(props: ConstructorPageProps) {
  const searchParams = await props.searchParams;
  const templateProductId = parseInteger(
    typeof searchParams.templateProductId === "string"
      ? searchParams.templateProductId
      : undefined,
  );
  const shopOrigin =
    typeof searchParams.shopOrigin === "string" ? searchParams.shopOrigin : undefined;

  return <ConstructorApp shopOrigin={shopOrigin} templateProductId={templateProductId} />;
}
