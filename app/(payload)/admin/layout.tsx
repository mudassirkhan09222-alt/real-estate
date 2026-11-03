import { RootLayout } from "@payloadcms/next/layouts";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import configPromise from "@payload-config";
import { importMap } from "./importMap";
import React from "react";
import "@payloadcms/next/css";
import type { ServerFunctionClient } from "payload";

type Args = {
  children: React.ReactNode;
};

/**
 * Bind config + importMap to handleServerFunctions to create a ServerFunctionClient.
 * This is the pattern Payload 3 uses in generated projects.
 */
const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
};

export default async function Layout({ children }: Args) {
  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
