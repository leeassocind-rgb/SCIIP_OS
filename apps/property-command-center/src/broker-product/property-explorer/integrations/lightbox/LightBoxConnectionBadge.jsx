import React from'react';
export default function LightBoxConnectionBadge({state}){
  const ready=state?.phase==='READY';
  return <div className={`explorer3__lb-connection ${ready?'is-ready':'is-offline'}`}>
    <span className="explorer3__lb-connection-dot"/>
    <strong>{ready?'LightBox live':'LightBox offline'}</strong>
    <em>{ready?'Secure proxy connected':'Explorer using SCIIP only'}</em>
  </div>;
}
