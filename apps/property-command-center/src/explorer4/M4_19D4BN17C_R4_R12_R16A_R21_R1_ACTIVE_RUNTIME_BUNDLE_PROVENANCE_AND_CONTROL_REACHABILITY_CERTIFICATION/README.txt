R21-R1 proves whether R21's generated Export/Presentation candidates are actually reachable from the currently served SCIIP application.

It probes the local Vite application, reads its served entry scripts, follows reachable JS chunk references, and compares live-served chunks against R21 candidate dist files. Disk presence alone is never treated as runtime activation.

No application-source or governed-data mutation. No pixel evidence. No live workflow action is executed.
