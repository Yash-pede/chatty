import { queryClient } from "@/lib/queryClient";
import { updateClerkUserById } from "@/queries/user.queries";
import { useUser } from "@clerk/clerk-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import DefaultPending from "@repo/ui/components/layout/DefaultPending";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type SettingsFormValues = {
  username: string;
  firstName: string;
  lastName: string;
};

export function SettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { user } = useUser();

  const form = useForm<SettingsFormValues>({
    defaultValues: {
      username: user?.username ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
    mode: "onSubmit",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: SettingsFormValues) =>
      updateClerkUserById(user?.id || "", values),

    onSuccess: () => {
      toast.success("Profile updated");
      onOpenChange?.(false);

      queryClient.invalidateQueries({
        queryKey: ["user-data", user?.id],
      });
    },

    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  function onSubmit(values: SettingsFormValues) {
    mutate(values);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Update your account information. Click save when you are done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-6 px-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="mt-auto flex gap-2 -mx-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? <DefaultPending /> : "Save changes"}
              </Button>

              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
