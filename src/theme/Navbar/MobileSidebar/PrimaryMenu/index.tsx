import SearchBar from "@theme/SearchBar";
import OriginalPrimaryMenu from "@theme-original/Navbar/MobileSidebar/PrimaryMenu";

interface PrimaryMenuWrapperProps {
  [key: string]: unknown;
}

export default function PrimaryMenuWrapper(props: PrimaryMenuWrapperProps) {
  return (
    <>
      <div className="navbar-sidebar__search" role="search" aria-label="Site search">
        <SearchBar />
      </div>
      <OriginalPrimaryMenu {...props} />
    </>
  );
}

PrimaryMenuWrapper.propTypes = {
  // Accept any props, or specify more strictly if desired
};
