import { ContinueButton } from "@packages/ui/components/bonus/continue-button";
import Link from "next/link";
import {
  OrganizationSwitcher,
  Protect,
  UserButton,
  UserProfile,
} from "@clerk/nextjs";
import { Icons } from "@packages/ui/components/bonus/icons";

const WelcomePage = ({ organizationSlug }: { organizationSlug: string }) => {
  return (
    <div className="flex flex-col items-center">
      <span>
        <h2 className="text-3xl font-bold">Welcome To Acme!</h2>
      </span>
      <div className="mt-4">
        <Link href={`/organization/${organizationSlug}/create-new-workspace/0`}>
          <ContinueButton name="Create Your First Workspace!" />
        </Link>
      </div>
    </div>
  );
};

const YouDontHaveAccess = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">
          You don't have any workspaces and you don't have permission to create
          a new one!
        </h2>
        <h2 className="text-2xl font-bold">
          Please contact your administrator.
        </h2>
      </div>
    </div>
  );
};

export default function Page({
  params,
}: {
  params: { organizationSlug: string; step: string };
}) {
  return (
    <Protect permission="org:workspace:create" fallback={<YouDontHaveAccess />}>
      <WelcomePage organizationSlug={params.organizationSlug} />
    </Protect>
  );
}
