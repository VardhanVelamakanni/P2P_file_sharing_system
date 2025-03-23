import { SidebarDemo } from './components/ui/navbar/floating-compo';
import { CoverDemo } from './components/ui/cover/cover-copm';
import { BackgroundWrapper } from './components/ui/cover/BackgroundWrapper';
import { StickyScrollRevealDemo } from './components/ui/component2/stickycomp';
function App() {
  return (
    <BackgroundWrapper>
      <SidebarDemo />
      <CoverDemo />
      <StickyScrollRevealDemo/>
      
    </BackgroundWrapper>
  );
}

export default App;
