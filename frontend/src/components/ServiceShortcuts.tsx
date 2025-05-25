import { Button } from "@heroui/react";
import React from "react";
import { FaFolder, FaFileAlt, FaImages, FaLock  } from "react-icons/fa";

function DelayedButton({
  name,
  icon,
  url,
}: {
  name: string;
  icon: React.ReactElement;
  url: string;
}) {
  const handleClick = () => {
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  };

  return (
    <Button
      endContent={icon}
      onClick={handleClick}
      aria-label={name}
      className="min-w-[200px] flex-1"
    >
      {name}
    </Button>
  );
}

export default function ServiceGrid() {
  return (
    <div className="flex gap-[28px] flex-wrap">
      <DelayedButton
        name="Files"
        icon={<FaFolder size={16} />}
        url="https://data.campfire-on-the-wall.com/camp-stash/"
      />
      <DelayedButton
        name="Photos"
        icon={<FaImages size={17} />}
        url="https://photos.campfire-on-the-wall.com/"
      />
      <DelayedButton
        name="Passwords"
        icon={<FaLock size={14} />}
        url="https://pass.campfire-on-the-wall.com/"
      />
      <DelayedButton
        name="PDF Editor"
        icon={<FaFileAlt size={14} />}
        url="https://pdf.campfire-on-the-wall.com/"
      />
    </div>
  );
}
