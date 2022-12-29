import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { getAccountToken } from "../helpers/api/auth";

const DynamicInspector = dynamic(
  () =>
    import("../../dashboard/components/inspector/Inspector").then(
      (mod) => mod.Inspector
    ),
  {
    ssr: false,
  }
);

export default function Inspect(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  console.log(router.query);

  const fileID = router.query.file as string;

  return (
    <>
      <Head>
        <title>UIMix</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {props.figmaToken && (
          <DynamicInspector fileID={fileID} accessToken={props.figmaToken} />
        )}
      </main>
    </>
  );
}

interface ServiceSideProps {
  figmaToken?: string;
}

// This gets called on every request
export const getServerSideProps: GetServerSideProps<ServiceSideProps> = async (
  context
) => {
  const figmaToken = await getAccountToken(context.req, "figma");

  return {
    props: {
      figmaToken,
    },
  };
};