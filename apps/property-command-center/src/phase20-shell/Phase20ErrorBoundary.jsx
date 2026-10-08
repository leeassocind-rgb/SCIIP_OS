import React from'react';
export default class Phase20ErrorBoundary extends React.Component{
 constructor(props){super(props);this.state={error:null}}
 static getDerivedStateFromError(error){return{error}}
 componentDidCatch(error,info){console.error('SCIIP Phase 20 render failure',error,info)}
 render(){if(!this.state.error)return this.props.children;return <section className="p20-fallback" role="alert"><p className="sciip-kicker">Workspace recovery</p><h1>This view could not be rendered.</h1><p>SCIIP preserved the application shell. Return Home or reload.</p><div className="p20-fallback__actions"><button type="button" onClick={this.props.onHome}>Return Home</button><button type="button" onClick={()=>window.location.reload()}>Reload</button></div></section>}
}
