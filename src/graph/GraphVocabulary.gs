/* ==========================================================
   SCIIP_OS
   Module: Graph
   File: GraphVocabulary.gs

   Purpose:
   Backward-compatible graph vocabulary wrapper.

   All vocabulary definitions now live in:

   SCIIP_VOCABULARY.gs

========================================================== */

function sciipGraphVocabularyStats() {

  return {
    nodeTypes:
      Object.keys(
        SCIIP.VOCABULARY.NODE_TYPES
      ).length,

    edgeTypes:
      Object.keys(
        SCIIP.VOCABULARY.EDGE_TYPES
      ).length,

    generatedAt:
      sciipNowIso()
  };
}