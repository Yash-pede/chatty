import { queryClient } from "@/lib/queryClient"
import { updateClerkUserById } from "@/queries/user.queries"
import { useUser } from "@clerk/clerk-react"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import DefaultPending from "@repo/ui/components/layout/DefaultPending"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@repo/ui/components/sheet"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

export function SettingsSheet({
    open,
    onOpenChange,
}: {
    open: boolean,
    onOpenChange?: (open: boolean) => void,
}) {
    const { user } = useUser()
    const [userDetails, setUserDetails] = useState({
        username: user?.username || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const { isPending, mutate: updateClerkUser } = useMutation({
        mutationFn: () =>
            updateClerkUserById(user?.id || "", userDetails),
        onSuccess: () => {
            toast("Profile Updated")
            onOpenChange && onOpenChange(false)
            queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
        },
        onError: () => {
            toast.error('Failed to update profile!');
        },
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-username">Username</Label>
                        <Input id="sheet-username" name="username" disabled={isPending} value={userDetails.username} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-firstname">First Name</Label>
                        <Input id="sheet-firstname" name="firstName" disabled={isPending} value={userDetails.firstName} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-lastname">Last Name</Label>
                        <Input id="sheet-lastname" name="lastName" disabled={isPending} value={userDetails.lastName} onChange={handleInputChange} />
                    </div>
                </div>
                <SheetFooter>
                    <Button type="button" onClick={() => updateClerkUser()} disabled={isPending}>{isPending ? <DefaultPending /> : 'Save changes'}</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
