import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@acme/ui/components/ui/card";
import { Button } from "@acme/ui/components/ui/button";

export default function NoChannel() {
  return (
    <main className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-center">Welcome to Croak</CardTitle>
          <CardDescription className="text-center ">
            Get started by creating your first channel.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-4">
          <p className="mb-4 text-center">
            Right click anywhere on the sidebar to create your first channel.
          </p>
          <Button className="w-full" variant="outline">
            Need Help?
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
