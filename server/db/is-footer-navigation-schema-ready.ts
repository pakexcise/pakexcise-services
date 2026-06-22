import "server-only";

import { Prisma } from "@prisma/client";

function modelHasField(modelName: string, fieldName: string): boolean {
  const model = Prisma.dmmf.datamodel.models.find((item) => item.name === modelName);
  return model?.fields.some((field) => field.name === fieldName) ?? false;
}

export function isFooterNavigationSchemaReady(): boolean {
  return (
    modelHasField("Service", "showInFooter") &&
    modelHasField("Service", "footerDisplayOrder") &&
    modelHasField("Region", "showInFooter") &&
    modelHasField("Region", "footerDisplayOrder")
  );
}
