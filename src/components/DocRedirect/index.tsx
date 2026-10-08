import Link from "@docusaurus/Link";
import { useHistory, useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import type React from "react";
import { useEffect } from "react";

/** Preserve incoming query strings and section links when a document moves. */
export default function DocRedirect({
  to,
  defaultHash,
  children,
}: {
  to: string;
  defaultHash: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const history = useHistory();
  const target = `${useBaseUrl(to)}${location.search}${location.hash || defaultHash}`;

  useEffect(() => {
    history.replace(target);
  }, [history, target]);

  return (
    <p>
      This page has moved. <Link to={target}>Continue to {children}.</Link>
    </p>
  );
}
