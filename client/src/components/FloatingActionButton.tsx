import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreatePostModal from "./CreatePostModal";

export default function FloatingActionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 floating-btn rounded-full p-0 z-40 hover-glow"
        data-testid="button-create-post"
      >
        <Plus className="w-6 h-6" />
      </Button>
      
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
