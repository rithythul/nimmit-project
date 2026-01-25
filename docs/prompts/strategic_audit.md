# Strategic Audit Prompt: Market Reality vs. Technical Execution

**User Goal:** Perform a deep strategic audit of Nimmit by combining two distinct expert perspectives: Market Intelligence and Technical Rigor.

**Context:** Nimmit is the "Operating System for Virtual Work"—a managed platform (not a marketplace) that connects US clients with a centralized, AI-powered talent pool in Cambodia.

---

## Instructions for Claude

Please activate two distinct skills for this session: **`competitor-alternatives`** and **`research-engineer`**. Use them to execute the following 3-phase audit.

### Phase 1: The External Benchmark (Skill: `competitor-alternatives`)
**Objective:** Establish the bar we must beat.
1.  **Analyze the Landscape:** Based on `docs/market_research.md`, identify the "Standard of Care" provided by:
    *   *Marketplaces* (Upwork/Fiverr): Speed, Variability, Trust.
    *   *Agencies* (Toptal/DesignJoy): Quality, Cost, Opacity.
2.  **Define the Gap:** What specific friction points in these competitors does Nimmit's "Context Cloud" and "Smart Routing" solve? Use the `competitor-alternatives` framework to be precise about weaknesses.

### Phase 2: The Internal Technical Audit (Skill: `research-engineer`)
**Objective:** Verify if our `docs/` and `src/` can actually deliver the solution defined in Phase 1.
*Critique the following documents with absolute scientific rigor:*
*   `docs/design.md` (Architecture)
*   `src/` (Codebase Structure)

**Key Audit Questions:**
1.  **"Institutional Memory" Viability:** Does the vector database/RAG implementation in `design.md` rigorously support the "Context Cloud" promise? Or is it just a buzzword?
2.  **Scaling "Smart Routing":** Is the data model (`Jobs` collection, `Worker` profiles) sufficient to support algorithmic matching vs. manual PM intervention?
3.  **Latency vs. Quality:** Does the "Overnight Magic" workflow have a technical critical path? (e.g., file transfer speeds via R2, rendering times).
4.  **Security/Privacy:** As an "Operating System" for businesses, are we technically isolating client data correctly?

### Phase 3: The Synthesis (Gap Analysis)
Compare the **Market Need** (Phase 1) with the **Technical Reality** (Phase 2).
*   Where is our "Product Vision" (`docs/product_vision.md`) writing checks that our Architecture (`docs/design.md`) cannot cash?
*   What is the single biggest technical risk to the "Nimmit" brand promise?

---

**Required Files to Read:**
Please read these files before starting:
1.  `docs/market_research.md`
2.  `docs/product_vision.md`
3.  `docs/concept.md`
4.  `docs/design.md`
5.  `README.md`
6.  (Optional) Scan `src/` to see the current implementation state.
