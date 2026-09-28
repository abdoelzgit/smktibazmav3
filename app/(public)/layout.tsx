import { SmoothScroll } from "@/components/smooth-scroll";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { PortalTransitionProvider, PortalOverlay } from "@/components/portal-transition";
import { ChatWidget } from "@/components/chatbot/chat-widget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalTransitionProvider>
      <SmoothScroll>
        <div id="public-page-content" className="w-full">
          <Navbar />
          {children}
          <Footer />
          <ChatWidget />
        </div>
        <PortalOverlay />
      </SmoothScroll>
    </PortalTransitionProvider>
  );
}


