import { useUser } from "@clerk/clerk-react"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@repo/ui/components/sheet"
import { useState } from "react"

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
    const handleUpdate = async () => {
        if (!user) return;

        await user?.update(userDetails)
        await user?.reload()

        alert("Profile updated successfully!") // temporarily using alert for feedback
    }

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
                        <Input id="sheet-username" name="username" value={userDetails.username} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-firstname">First Name</Label>
                        <Input id="sheet-firstname" name="firstName" value={userDetails.firstName} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-lastname">Last Name</Label>
                        <Input id="sheet-lastname" name="lastName" value={userDetails.lastName} onChange={handleInputChange} />
                    </div>
                </div>
                <SheetFooter>
                    <Button type="button" onClick={() => handleUpdate()}>Save changes</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
