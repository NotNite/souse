import React from "react";

function makeElement(name: string, xmlns?: string) {
  const func = (props: any) => {
    const propsWithoutChildren = { ...props };
    delete propsWithoutChildren.children;

    return React.createElement(
      name,
      {
        ...propsWithoutChildren,
        xmlns
      },
      props.children
    );
  };

  func.displayName = name;
  return func;
}

export const Message = makeElement("message", "jabber:client");
export const Body = makeElement("body");
export const IQ = makeElement("iq", "jabber:client");
export const Query = makeElement("query", "jabber:iq:roster");
export const Presence = makeElement("presence", "jabber:client");
export const VCard = makeElement("vCard", "vcard-temp");
