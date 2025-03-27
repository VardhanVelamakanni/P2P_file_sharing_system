import { SidebarDemo } from './components/ui/navbar/floating-compo';
import { CoverDemo } from './components/ui/cover/cover-copm';
import { BackgroundWrapper } from './components/ui/cover/BackgroundWrapper';
import { StickyScrollRevealDemo } from './components/ui/component2/stickycomp';
import { FlipWordsDemo } from './components/ui/footer/flipcomp';
import FileShare from './components/FileShare';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <BackgroundWrapper>
      <SidebarDemo />
      <CoverDemo />
      <StickyScrollRevealDemo />
      <FlipWordsDemo/>
    </BackgroundWrapper>
  );[
    
  ]}

function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage with Cover, Sidebar, and Sticky Scroll */}
        <Route path="/" element={<HomePage />} />

        {/* P2P File Sharing Room */}
        <Route path="/room/:roomId" element={<FileShare />} />
      </Routes>
    </Router>
  );
}

export default App;
