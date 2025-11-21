import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  CreditCard, 
  MessageSquare, 
  FileText, 
  Image as ImageIcon,
  LayoutDashboard,
  UserCircle,
  Sparkles,
  FileSearch,
  Code,
  Zap,
  Languages
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarHeader
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const location = useLocation();

  const features = [
    {
      title: "Card Scanner",
      icon: CreditCard,
      url: "/card-scanner",
      description: "Scan business cards with AI"
    },
    {
      title: "AI Chat Assistant",
      icon: MessageSquare,
      url: "/ai-chat",
      description: "Chat with Google M"
    },
    {
      title: "Document Analyzer",
      icon: FileText,
      url: "/document-analyzer",
      description: "Analyze documents with AI"
    },
    {
      title: "Image to Text",
      icon: ImageIcon,
      url: "/image-to-text",
      description: "Extract text from images"
    },
    {
      title: "Text Summarizer",
      icon: FileSearch,
      url: "/text-summarizer",
      description: "Summarize long texts"
    },
    {
      title: "Code Generator",
      icon: Code,
      url: "/code-generator",
      description: "Generate code with AI"
    },
    {
      title: "Quick Actions",
      icon: Zap,
      url: "/quick-actions",
      description: "Quick AI-powered tasks"
    },
    {
      title: "Translator",
      icon: Languages,
      url: "/translator",
      description: "Translate text with AI"
    },
  ];

  const otherPages = [
    {
      title: "Home",
      icon: LayoutDashboard,
      url: "/",
    },
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/dashboard",
    },
    {
      title: "Profile",
      icon: UserCircle,
      url: "/profile",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
        <Sidebar className="border-r-2 border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
          <SidebarHeader className="border-b-2 border-blue-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-red-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex h-20 items-center gap-3 px-5">
              <Link to="/" className="flex items-center gap-3">
                <img 
                  src="https://res.cloudinary.com/dcefror3c/image/upload/v1763631642/Gemini_Generated_Image_cb3kx4cb3kx4cb3k_1_cnxhku.png" 
                  alt="Google M Logo" 
                  className="h-12 w-12 object-contain rounded-xl shadow-lg"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500 bg-clip-text text-transparent">Google M</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">AI-Powered Suite</span>
                </div>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>

            {/* Features Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider px-4">AI Features</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <SidebarMenuItem key={feature.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(feature.url)}
                          className={cn(
                            "w-full justify-start rounded-xl my-1 px-4 py-6 transition-all duration-200",
                            isActive(feature.url) 
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800" 
                              : "text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:shadow-md"
                          )}
                        >
                          <Link to={feature.url}>
                            <Icon className="h-5 w-5 mr-3 shrink-0" />
                            <div className="flex flex-col items-start">
                              <span className="font-semibold">{feature.title}</span>
                              <span className="text-xs opacity-80">{feature.description}</span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Other Pages */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider px-4">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {otherPages.map((page) => {
                    const Icon = page.icon;
                    return (
                      <SidebarMenuItem key={page.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(page.url)}
                          className={cn(
                            "w-full justify-start rounded-xl my-1 px-4 py-3 transition-all duration-200",
                            isActive(page.url) 
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800" 
                              : "text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:shadow-md"
                          )}
                        >
                          <Link to={page.url}>
                            <Icon className="h-5 w-5 mr-3 shrink-0" />
                            <span className="font-semibold">{page.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Top Bar with Sidebar Toggle */}
          <div className="flex h-20 items-center gap-4 border-b-2 border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 shadow-sm">
            <SidebarTrigger className="hover:bg-blue-100 dark:hover:bg-slate-700 rounded-xl" />
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dcefror3c/image/upload/v1763631642/Gemini_Generated_Image_cb3kx4cb3kx4cb3k_1_cnxhku.png" 
                alt="Google M Logo" 
                className="h-10 w-10 object-contain rounded-xl shadow-lg"
              />
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500 bg-clip-text text-transparent hidden sm:inline">Google M</span>
            </Link>
            <div className="flex-1" />
          </div>
          
          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

