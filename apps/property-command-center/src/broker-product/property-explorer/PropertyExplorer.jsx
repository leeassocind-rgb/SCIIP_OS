import React from'react';
import ExplorerPropertyIntelligenceOS from'./v5/ExplorerPropertyIntelligenceOS.jsx';
import Explorer3 from'./v6/Explorer3.jsx';

export default function PropertyExplorer(){
  const params=new URLSearchParams(globalThis.location?.search||'');
  const requested=params.get('explorer');
  const envVersion=import.meta.env.VITE_EXPLORER_VERSION||'3';
  const useLegacy=requested==='2'||(requested!=='3'&&envVersion==='2');
  return useLegacy?React.createElement(ExplorerPropertyIntelligenceOS):React.createElement(Explorer3);
}
