import { parseError, SouseError, ErrorEnum } from "@/lib/errors";
import { useAccountsStore } from "@/lib/stores/accounts";
import { setSecret, tryConnect } from "@/lib/tauri";
import { Form, Formik } from "formik";
import React from "react";
import { FormInput } from "../form";
import { usePopupStore } from "@/lib/stores/popup";

export default function SignIn() {
  const [error, setError] = React.useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useAccountsStore((state) => [
    state.currentAccount,
    state.setCurrentAccount
  ]);
  const setCurrentPopup = usePopupStore((state) => state.setCurrentPopup);

  return (
    <div className="form popupCenter">
      <h1>Sign in</h1>
      {error && <span className="textError">{error}</span>}
      <Formik
        initialValues={{ jid: currentAccount ?? "", password: "" }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          const { jid, password } = values;
          await setCurrentAccount(jid);
          await setSecret(jid, password);

          try {
            await tryConnect(jid, password);
            setCurrentPopup(null);
          } catch (e) {
            const [error, data] = parseError(e as SouseError);
            switch (error) {
              case ErrorEnum.ParseJid:
                setError("Invalid JID.");
                break;

              case ErrorEnum.AuthFail:
                setError(`Couldn't authenticate: ${data}`);
                break;
            }
          }

          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormInput type="text" name="jid" label="JID" />
            <FormInput type="password" name="password" label="Password" />
            <FormInput
              type="submit"
              name="login"
              value="Login"
              disabled={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
}
