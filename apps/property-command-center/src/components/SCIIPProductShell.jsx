import React,{useEffect,useState}from'react';
import{Bell,Building2,BriefcaseBusiness,Clock3,LayoutDashboard,Map,Search,Sparkles,Sunrise}from'lucide-react';
import{PRODUCT_NAVIGATION}from'../product-shell/productNavigation.js';
import ProductHome from'../product-shell/ProductHome.jsx';
import ProductMorningBrief from'../product-shell/ProductMorningBrief.jsx';
import ProductPlaceholder from'../product-shell/ProductPlaceholder.jsx';
import'../design-system/tokens/tokens.css';
import'../design-system/styles/foundations.css';
import'../design-system/styles/components.css';
import'../product-shell/product-shell.css';

const ICONS={Bell,Building2,BriefcaseBusiness,Clock3,LayoutDashboard,Map,Search,Sparkles,Sunrise};

export default function SCIIPProductShell(){
  const[nav,setNav]=useState('Home');

  useEffect(()=>{
    const handler=event=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault();
        setNav('Search');
      }
    };
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[]);

  return (
    <div className="product-shell sciip-ds-root">
      <aside className="product-sidebar">
        <div className="product-brand">
          <div className="product-brand__mark">S</div>
          <div><strong>SCIIP</strong><span>Industrial Intelligence OS</span></div>
        </div>
        <nav className="product-nav" aria-label="SCIIP product navigation">
          {PRODUCT_NAVIGATION.map(item=>{
            const Icon=ICONS[item.icon]||LayoutDashboard;
            return (
              <button
                type="button"
                key={item.id}
                className={nav===item.id?'active':''}
                aria-current={nav===item.id?'page':undefined}
                onClick={()=>setNav(item.id)}
              >
                <Icon size={18}/>
                {item.label}
              </button>
            );
          })}
        </nav>
        <footer>Broker product experience</footer>
      </aside>

      <main className="product-main">
        <header className="product-topbar">
          <button type="button" onClick={()=>setNav('Search')}>
            <Search size={16}/><span>Search SCIIP…</span><kbd>⌘K</kbd>
          </button>
          <Bell size={18}/>
          <div className="product-avatar">SC</div>
        </header>

        {nav==='Home'
          ? <ProductHome onNavigate={setNav}/>
          : nav==='Morning Brief'
            ? <ProductMorningBrief/>
            : <ProductPlaceholder destination={nav}/>}
      </main>
    </div>
  );
}
