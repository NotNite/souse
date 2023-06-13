import {
  ActionFunctionArgs,
  ParamParseKey,
  Params,
  useLoaderData
} from "react-router";

type Args = { jid: string };

export async function loader({ params }: { params: { jid?: string } }) {
  return { jid: params.jid! };
}

export default function Conversation() {
  const { jid } = useLoaderData() as Args;
  return <p>{jid}</p>;
}
