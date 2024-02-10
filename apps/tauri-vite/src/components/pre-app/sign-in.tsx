import { SignIn } from "@clerk/clerk-react";
import { useTheme } from "@/theme"; // If you're using Context
import { dark } from "@clerk/themes";
import { BackgroundBeams } from "@acme/ui/components/aceternity/background-beams";

const SignInPage = () => {
  const { theme } = useTheme(); // If you're using Context

  return (
    <div>
      <BackgroundBeams />
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex flex-row pb-6">
          <div className={" mb-4 ml-4 text-center"}>
            <h2
              className={`relative z-10 bg-gradient-to-b from-black to-green-600 bg-clip-text text-center font-sans text-6xl font-bold md:text-7xl`}
            >
              Sign In To Croak
            </h2>
            <h2 className="mt-1 text-2xl font-bold"></h2>
          </div>
        </div>
        <div className="w-[50vh]">
          <SignIn appearance={theme === "dark" ? (dark as any) : undefined} />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
