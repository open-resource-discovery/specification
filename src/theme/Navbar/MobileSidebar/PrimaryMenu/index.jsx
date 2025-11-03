import React from "react";
import SearchBar from "@theme/SearchBar";
import OriginalPrimaryMenu from "@theme-original/Navbar/MobileSidebar/PrimaryMenu";

export default function PrimaryMenuWrapper(props) {
  return (
    <>
      <div className="navbar-sidebar__search" role="search" aria-label="Site search">
        <SearchBar />
      </div>
      <OriginalPrimaryMenu {...props} />
    </>
  );
}
