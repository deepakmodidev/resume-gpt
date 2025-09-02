"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import {
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  NotepadTextDashed,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GeminiApiKeyModal } from "@/components/GeminiApiKeyModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  session: Session;
  onNewChat: () => void;
  currentChatId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

// Helper function to group chats by timeframe
const groupChatsByTimeframe = (chats: Chat[]) => {
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);

  const lastYear = new Date(now);
  lastYear.setFullYear(now.getFullYear() - 1);

  return {
    last7Days: chats.filter((chat) => new Date(chat.updatedAt) > lastWeek),
    thisYear: chats.filter((chat) => {
      const updatedAt = new Date(chat.updatedAt);
      return updatedAt <= lastWeek && updatedAt > lastYear;
    }),
    older: chats.filter((chat) => new Date(chat.updatedAt) <= lastYear),
  };
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

const ChatListItem = ({
  chat,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  isEditing,
  editValue,
  setEditValue,
  onSaveEdit,
  onCancelEdit,
}: {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (chat: Chat) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  editValue: string;
  setEditValue: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) => {
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={cn(
        "flex items-center p-2 rounded-lg cursor-pointer group transition-colors",
        isActive
          ? "bg-primary/10 text-primary border border-primary/20"
          : "hover:bg-muted/50",
      )}
      onClick={() => !isEditing && onSelect(chat.id)}
    >
      <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mr-2" />

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              ref={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSaveEdit();
                } else if (e.key === "Escape") {
                  onCancelEdit();
                }
              }}
              onBlur={onSaveEdit}
              className="h-7 text-sm"
            />
          </div>
        ) : (
          <div className="space-y-0.5">
            <p className="text-sm font-medium truncate">
              {truncateText(chat.title, 22)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(chat.updatedAt)}
            </p>
          </div>
        )}
      </div>

      {!isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(chat)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelect(chat.id)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(chat.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

const SidebarContent = ({
  session,
  onNewChat,
  currentChatId,
  isCollapsed = false,
  onToggleCollapse,
}: {
  session: Session;
  onNewChat: () => void;
  currentChatId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasUserApiKey, setHasUserApiKey] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchChats();
    checkUserApiKey();
  }, []);

  const checkUserApiKey = () => {
    const userApiKey = localStorage.getItem("gemini-api-key");
    setHasUserApiKey(!!userApiKey);
  };

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat");
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      const data = await response.json();
      if (Array.isArray(data.chats)) {
        const chatsWithDates = data.chats.map((chat) => ({
          ...chat,
          updatedAt: chat.updatedAt || new Date().toISOString(),
        }));
        setChats(chatsWithDates);
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Error fetching chats");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ redirectTo: "/" });
  };

  const handleGeminiApiKey = () => {
    setShowApiKeyModal(true);
  };

  const handleApiKeyModalClose = () => {
    setShowApiKeyModal(false);
    checkUserApiKey(); // Refresh the API key status
  };

  const startEditing = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditValue(chat.title);
  };

  const handleChatRename = async () => {
    if (!editValue.trim()) {
      toast.error("Chat name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: editingChatId,
          newName: editValue.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update chat title");
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === editingChatId
            ? { ...chat, title: editValue.trim() }
            : chat,
        ),
      );

      toast.success("Chat name updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update chat name");
    } finally {
      setEditingChatId(null);
      setEditValue("");
      setIsLoading(false);
    }
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditValue("");
  };

  const handleChatDelete = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete chat");
      }

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/builder/${chatId}`);
  };

  const filteredChats = searchQuery
    ? chats.filter((chat) =>
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : chats;

  const groupedChats = groupChatsByTimeframe(filteredChats);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-500/50">
                <NotepadTextDashed className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
              <h1 className="font-bold text-xl tracking-tight bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent whitespace-nowrap">
                ResumeGPT
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-8 w-8 transition-all duration-200 hover:bg-muted"
                title={`${isCollapsed ? "Expand" : "Collapse"} sidebar (Ctrl+\\)`}
              >
                <div className="transition-transform duration-200">
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </div>
              </Button>
            )}
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className={cn(
            "justify-start bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-xs hover:shadow-md transition-all duration-300 ease-in-out",
            isCollapsed ? "w-auto px-2" : "w-full",
          )}
          size="sm"
          title={isCollapsed ? "New Chat" : undefined}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-2",
            )}
          >
            New Chat
          </span>
        </Button>
      </div>

      {/* Search - Hide when collapsed */}
      <div
        className={cn(
          "border-b transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "h-0 opacity-0" : "h-auto opacity-100",
        )}
      >
        <div className="p-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Chat List - Show minimal version when collapsed */}
      <ScrollArea className="flex-1 p-2">
        {isCollapsed ? (
          // Collapsed view - show only icons
          <div className="space-y-2">
            {chats.slice(0, 10).map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-10 p-0",
                  currentChatId === chat.id && "bg-primary/10 text-primary",
                )}
                onClick={() => handleChatSelect(chat.id)}
                title={chat.title}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            ))}
          </div>
        ) : (
          // Expanded view - show full chat list
          <>
            {isLoading && chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading chats...
                </p>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="p-4 rounded-full bg-muted/50">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">No chats yet</p>
                  <p className="text-xs text-muted-foreground">
                    Start a conversation to see your chats here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {groupedChats.last7Days.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-medium text-muted-foreground px-1">
                      Last 7 Days
                    </h3>
                    {groupedChats.last7Days.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isActive={currentChatId === chat.id}
                        onSelect={handleChatSelect}
                        onEdit={startEditing}
                        onDelete={handleChatDelete}
                        isEditing={editingChatId === chat.id}
                        editValue={editValue}
                        setEditValue={setEditValue}
                        onSaveEdit={handleChatRename}
                        onCancelEdit={cancelEditing}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.thisYear.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-medium text-muted-foreground px-1">
                      This Year
                    </h3>
                    {groupedChats.thisYear.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isActive={currentChatId === chat.id}
                        onSelect={handleChatSelect}
                        onEdit={startEditing}
                        onDelete={handleChatDelete}
                        isEditing={editingChatId === chat.id}
                        editValue={editValue}
                        setEditValue={setEditValue}
                        onSaveEdit={handleChatRename}
                        onCancelEdit={cancelEditing}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.older.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-medium text-muted-foreground px-1">
                      Older
                    </h3>
                    {groupedChats.older.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isActive={currentChatId === chat.id}
                        onSelect={handleChatSelect}
                        onEdit={startEditing}
                        onDelete={handleChatDelete}
                        isEditing={editingChatId === chat.id}
                        editValue={editValue}
                        setEditValue={setEditValue}
                        onSaveEdit={handleChatRename}
                        onCancelEdit={cancelEditing}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isCollapsed ? "h-0 opacity-0" : "h-auto opacity-100",
            )}
          >
            <Button
              variant="outline"
              onClick={handleGeminiApiKey}
              className="w-full justify-start gap-2"
              size="sm"
            >
              <Settings className="h-4 w-4" />
              <span>
                {hasUserApiKey ? "Update Gemini API Key" : "Add Gemini API Key"}
              </span>
              {hasUserApiKey && (
                <div
                  className="ml-auto w-2 h-2 bg-green-500 rounded-full"
                  title="API Key configured"
                />
              )}
            </Button>
          </div>

          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isCollapsed ? "h-0 opacity-0" : "h-auto opacity-100",
            )}
          >
            <div className="shrink-0 bg-border h-px w-full" />
          </div>

          <div
            className={cn(
              "flex items-center p-2 transition-all duration-300 ease-in-out",
              isCollapsed ? "justify-center" : "justify-between w-full",
            )}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Image
                  src={session?.user.image || "/default-avatar.png"}
                  height={24}
                  width={24}
                  className="w-6 h-6 rounded-full object-cover"
                  alt="User Avatar"
                />
              </div>
              <div
                className={cn(
                  "flex flex-col items-start text-left transition-all duration-300 ease-in-out overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                )}
              >
                <p className="ml-2 text-sm font-medium whitespace-nowrap">
                  {truncateText(session?.user.name || "", 15)}
                </p>
                <p className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
                  {truncateText(session?.user.email || "", 15)}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 p-4"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isCollapsed ? "h-0 opacity-0" : "h-auto opacity-100",
            )}
          >
            <div className="shrink-0 bg-border h-px w-full" />
          </div>

          <div
            className={cn(
              "flex items-center transition-all duration-300 ease-in-out",
              isCollapsed ? "justify-center" : "justify-start",
            )}
          >
            <ThemeToggle />
            <span
              className={cn(
                "text-sm text-muted-foreground transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "ml-2 w-auto opacity-100",
              )}
            >
              Theme
            </span>
          </div>
        </div>
      </div>

      {/* Gemini API Key Modal */}
      <GeminiApiKeyModal
        isOpen={showApiKeyModal}
        onClose={handleApiKeyModalClose}
      />
    </div>
  );
};

export const ChatSidebar = ({
  session,
  onNewChat,
  currentChatId,
  isCollapsed = false,
  onToggleCollapse,
}: ChatSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border md:hidden">
          <div className="flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent
                  session={session}
                  onNewChat={onNewChat}
                  currentChatId={currentChatId}
                  isCollapsed={false}
                  onToggleCollapse={undefined}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-500/50">
                <NotepadTextDashed className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
              <h1 className="font-bold text-lg tracking-tight bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                ResumeGPT
              </h1>
            </div>
          </div>

          <ThemeToggle />
        </header>
      </>
    );
  }

  return (
    <div
      className={cn(
        "hidden md:flex h-full border-r bg-card transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent
          session={session}
          onNewChat={onNewChat}
          currentChatId={currentChatId}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </div>
    </div>
  );
};
