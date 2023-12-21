import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export const TopBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col justify-center">
      <div className="grid w-full grid-cols-2 items-center py-3">
        <div className="flex px-6">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/organization/:slug"
            afterSelectPersonalUrl="/user/:id"
            afterSelectOrganizationUrl="/organization/:slug"
          />
        </div>
        <div className="mr-12 justify-self-end">
          <UserButton afterSignOutUrl="/" afterSwitchSessionUrl="/" />
        </div>
      </div>
      <div className="flex flex-grow items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default TopBar;
