import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertCircle, 
  BarChart3, 
  FileText, 
  Home, 
  LogOut, 
  Menu, 
  Settings, 
  Users, 
  X 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { path: '/', label: 'Accueil', icon: <Home className="w-4 h-4 mr-2" /> },
    { path: '/audits', label: 'Audits', icon: <FileText className="w-4 h-4 mr-2" /> },
    { path: '/reports', label: 'Rapports', icon: <BarChart3 className="w-4 h-4 mr-2" /> }
  ];

  if (user?.role === 'admin') {
    navItems.push({ 
      path: '/users', 
      label: 'Utilisateurs', 
      icon: <Users className="w-4 h-4 mr-2" /> 
    });
    navItems.push({ 
      path: '/frameworks', 
      label: 'Référentiels', 
      icon: <AlertCircle className="w-4 h-4 mr-2" /> 
    });
  }

  return (
    <nav className="glass sticky top-0 z-50 w-full py-3 px-4 md:px-6 animate-fade-in">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-primary font-bold text-lg md:text-xl">
            SecuReporter
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-secondary flex items-center ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full flex items-center gap-2 hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to="/profile" className="flex w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-card z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          <div className="text-primary font-bold">SecuReporter</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-3 rounded-md text-sm font-medium transition-colors hover:bg-secondary flex items-center mb-1 ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          
          <Separator className="my-4" />
          
          {user && (
            <>
              <div className="px-3 py-2 flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
              
              <Link
                to="/profile"
                className="px-3 py-3 rounded-md text-sm font-medium transition-colors hover:bg-secondary flex items-center mb-1 mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Link>
              
              <Button
                variant="ghost"
                className="px-3 py-3 rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive flex items-center justify-start w-full"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
