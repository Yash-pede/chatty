import { Ellipsis, Mic, Paperclip, Phone, Smile, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@repo/ui/components/dropdown-menu.js";
import React from "react";
import { Input } from "../input.js";
import { Button } from "../button.js";

const Chatbox = () => {
  return (
    <div className="border flex-1 justify-between flex flex-col p-6 ">
      {/* TOP BAR  */}
      <div className="flex justify-between ">
        <div className="flex gap-4">
          <div className="relative">
            <div className="border rounded-full p-3 size-10 bg-black"></div>
            <div className="bg-green-400 size-3 rounded-full absolute bottom-1 right-0" />
          </div>
          <div>
            <p className="font-bold">Sandeep Singh</p>
            <p className="text-green-400 text-sm">Online</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Video className="border p-2 size-9 bg-white dark:bg-black rounded-sm" />
          <div className="border flex justify-center items-center   p-2 size-9 bg-white dark:bg-black rounded-sm">
            <Phone className="size-4" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="size-4 mb-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5">
              {["View profile", "Add to archive", "Block", "Delete"].map(
                (item, index) => (
                  <React.Fragment key={item}>
                    <DropdownMenuItem>{item}</DropdownMenuItem>
                    {index === 1 && <DropdownMenuSeparator />}
                  </React.Fragment>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="border-black border-2 flex-1"></div>
      {/* Message input box */}
      <div className="w-full flex ">
        <Input
          type="text"
          placeholder="Enter Message"
          className="h-12 w-[75%] text-gray-800"
        />
        <div className="flex justify-center items-center flex-1 gap-2">
          {[Smile, Paperclip, Mic].map((Icon, index) => (
            <Button
              key={index}
              className="bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200"
            >
              <Icon className="size-4.5" />
            </Button>
          ))}
          <Button className="bg-black text-white">Send</Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
