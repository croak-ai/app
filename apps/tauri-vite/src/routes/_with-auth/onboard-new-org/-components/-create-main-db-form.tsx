import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@acme/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/components/ui/form";

import { useForm } from "react-hook-form";
import Loading from "@acme/ui/components/bonus/loading";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/components/ui/select";
import { trpc } from "@/utils/trpc";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "@tanstack/react-router";

export default function CreateMainDB({ redirect }: { redirect: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useUser();

  const createNewMainDB = trpc.createNewTursoDB.createNewTursoDB.useMutation();

  const groupLocations = trpc.getAvailableGroups.getAvailableGroups.useQuery(
    {} as any,
  );

  if (error) {
    setLoading(false);
    throw error;
  }

  if (groupLocations.error) {
    throw groupLocations.error;
  }

  const formSchema = z.object({
    groupCode: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    //const onSubmit = async () => {
    try {
      setLoading(true);

      const result = await createNewMainDB.mutateAsync({
        group: data.groupCode,
      });

      if (result) {
        await user?.reload();
        setSuccess(true);
      }
    } catch (e) {
      setError(e as Error);
    }
  };

  if (success) {
    return <Navigate to={redirect} />;
  }
  return (
    <>
      <div className="space-y-6 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="groupCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Region</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full md:w-[400px]">
                        <SelectValue placeholder="Select a Primary Region" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {groupLocations.isLoading ? (
                        <Button
                          disabled={true}
                          className="w-full"
                          variant={"outline"}
                          size={"sm"}
                        >
                          <Loading name="Loading Regions" />
                        </Button>
                      ) : (
                        groupLocations.data?.availableGroups.map((location) => (
                          <SelectItem
                            key={location.name}
                            value={location.name} // Use location.code here for selection value.
                          >
                            {location.locationName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  <FormDescription>
                    This is the primary region for your Organization, but we
                    will replicate your data globally. You can not change this
                    later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      <div className="flex justify-end py-4">
        {loading ? (
          <Button disabled={true}>
            <Loading name={"Creating Database"} />
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={groupLocations.isFetching}
          >
            Submit
          </Button>
        )}
      </div>
    </>
  );
}
