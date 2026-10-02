import OriginalPrimaryMenu from "@theme-original/Navbar/MobileSidebar/PrimaryMenu";
import { lazy, Suspense } from "react";
import "./styles.css";

const SearchBar = lazy(() => import("@theme/SearchBar"));

interface PrimaryMenuWrapperProps {
  [key: string]: unknown;
}

export default function PrimaryMenuWrapper(props: PrimaryMenuWrapperProps) {
  return (
    <>
      <Suspense fallback={null}>
        <search className="navbar-sidebar__search" aria-label="Site search">
          <SearchBar />
        </search>
      </Suspense>
      <OriginalPrimaryMenu {...props} />
    </>
  );
}

PrimaryMenuWrapper.propTypes = {
  // Accept any props, or specify more strictly if desired
};
