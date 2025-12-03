# Diagramas de Sequência

Este documento contém os principais fluxos do sistema representados em diagramas de sequência.

## 1. Fluxo de Upload e Processamento de Documento

```mermaid
sequenceDiagram
    actor User as Usuário
    participant UI as Interface Web
    participant API as API Controller
    participant Storage as StorageService
    participant R2 as Cloudflare R2
    participant Process as ProcessingService
    participant Extract as TextExtractor
    participant Chunk as Chunker
    participant Embed as EmbeddingService
    participant AI as AI Provider
    participant DB as PostgreSQL

    User->>UI: Seleciona e envia documento
    UI->>API: POST /api/upload (arquivo)
    
    API->>Storage: uploadFile(file, userId)
    Storage->>Storage: checkStorageQuota(userId, fileSize)
    Storage->>R2: putObject(key, data)
    R2-->>Storage: URL do objeto
    Storage->>DB: CREATE Document (status: UPLOADING)
    Storage-->>API: UploadResult {documentId, r2Key}
    
    API-->>UI: {documentId, status: "UPLOADING"}
    UI-->>User: Mostra progresso
    
    Note over API,Process: Processamento Assíncrono
    
    API->>Process: processDocument(documentId)
    Process->>DB: UPDATE Document (status: PROCESSING)
    
    Process->>Storage: downloadFile(r2Key)
    Storage->>R2: getObject(key)
    R2-->>Storage: Buffer do arquivo
    Storage-->>Process: File
    
    Process->>Extract: extractText(file)
    alt PDF
        Extract->>Extract: extractFromPDF(file)
    else DOCX
        Extract->>Extract: extractFromDOCX(file)
    else TXT/MD
        Extract->>Extract: extractFromText(file)
    end
    Extract-->>Process: texto extraído
    
    Process->>Chunk: chunkText(text)
    Chunk->>Chunk: splitRecursively(text, chunkSize, overlap)
    Chunk-->>Process: ChunkResult[]
    
    Process->>DB: INSERT Chunks (batch)
    
    loop Para cada chunk
        Process->>Embed: generateEmbedding(chunkContent)
        Embed->>AI: API call (text-embedding)
        AI-->>Embed: vector[1536]
        Embed-->>Process: embedding vector
        Process->>DB: INSERT Embedding
    end
    
    Process->>DB: UPDATE Document (status: INDEXED)
    Process-->>API: ProcessingResult {success: true}
    
    API-->>UI: WebSocket notification
    UI-->>User: "Documento processado com sucesso!"
```

## 2. Fluxo de Geração de Questões (RAG)

```mermaid
sequenceDiagram
    actor User as Usuário
    participant UI as Interface Web
    participant API as QuestionController
    participant Gen as QuestionGenerationService
    participant RAG as RAGService
    participant Vector as VectorSearchService
    participant AI as AI Provider
    participant DB as PostgreSQL

    User->>UI: Seleciona níveis cognitivos e clica "Gerar"
    UI->>API: POST /api/generate<br/>{documentId, levels, questionsPerLevel}
    
    API->>Gen: generateQuestions(documentId, levels)
    
    loop Para cada nível cognitivo
        Gen->>Gen: buildQueryForLevel(level)
        
        Note over Gen,RAG: Fase de Retrieval (RAG)
        Gen->>RAG: retrieveContext(documentId, query)
        
        RAG->>AI: generateEmbedding(query)
        AI-->>RAG: queryVector[1536]
        
        RAG->>Vector: searchSimilarChunks(documentId, queryVector, topK)
        Vector->>DB: SELECT com pgvector<br/>(similaridade de cosseno)
        DB-->>Vector: Chunks ordenados por similaridade
        Vector-->>RAG: SearchResult[]
        
        RAG->>RAG: rerankResults(results)
        RAG->>RAG: formatContextForPrompt(chunks)
        RAG-->>Gen: RetrievalResult {chunks, context}
        
        Note over Gen,AI: Fase de Generation
        Gen->>Gen: buildPrompt(context, level, count)
        Gen->>AI: generateCompletion(prompt)
        AI-->>Gen: Resposta JSON com questões
        
        Gen->>Gen: parseAIResponse(response)
        Gen->>Gen: estimateDifficulty(questions)
        Gen->>Gen: extractEvidence(chunks, questions)
        
        loop Para cada questão gerada
            Gen->>DB: INSERT Question
        end
    end
    
    Gen->>DB: INSERT GenerationLog<br/>(métricas, latência, custo)
    Gen-->>API: Question[] geradas
    
    API-->>UI: {questions: [...], total: 12}
    UI-->>User: Exibe questões geradas
```

## 3. Fluxo de Autenticação

```mermaid
sequenceDiagram
    actor User as Usuário
    participant UI as Interface Web
    participant API as API Auth
    participant Auth as AuthService
    participant DB as PostgreSQL
    
    alt Login com Email/Senha
        User->>UI: Insere email e senha
        UI->>API: POST /api/auth/signin<br/>{email, password}
        
        API->>Auth: authenticate(email, password)
        Auth->>DB: SELECT User WHERE email
        DB-->>Auth: User
        
        Auth->>Auth: verifyPassword(password, user.password)
        
        alt Senha válida
            Auth->>Auth: createSession(userId)
            Auth->>DB: INSERT Session
            DB-->>Auth: Session {token}
            Auth-->>API: {user, session}
            
            API-->>UI: Set-Cookie: session_token
            UI-->>User: Redireciona para Dashboard
        else Senha inválida
            Auth-->>API: Error: Invalid credentials
            API-->>UI: 401 Unauthorized
            UI-->>User: "Email ou senha incorretos"
        end
    else Login com Google OAuth
        User->>UI: Clica em "Login com Google"
        UI->>API: GET /api/auth/google
        API-->>UI: Redirect Google OAuth
        
        UI->>Google: Autorização
        Google-->>UI: Authorization code
        
        UI->>API: GET /api/auth/callback?code=...
        API->>Google: Exchange code for tokens
        Google-->>API: {access_token, id_token}
        
        API->>API: Decode id_token (user info)
        API->>DB: SELECT User WHERE email
        
        alt Usuário existe
            API->>DB: UPDATE Account (tokens)
        else Novo usuário
            API->>DB: INSERT User
            API->>DB: INSERT Account
        end
        
        API->>DB: INSERT Session
        API-->>UI: Set-Cookie: session_token
        UI-->>User: Redireciona para Dashboard
    end
```

## 4. Fluxo de Consulta RAG (Query Tester)

```mermaid
sequenceDiagram
    actor User as Usuário
    participant UI as Interface Web
    participant API as QueryController
    participant RAG as RAGService
    participant Vector as VectorSearchService
    participant AI as AI Provider
    participant DB as PostgreSQL

    User->>UI: Digita consulta e clica "Buscar"
    UI->>API: POST /api/query<br/>{documentId, query, topK}
    
    API->>RAG: retrieveContext(documentId, query, options)
    
    Note over RAG,AI: Gera embedding da consulta
    RAG->>AI: generateEmbedding(query)
    AI-->>RAG: queryVector[1536]
    
    Note over RAG,DB: Busca semântica no pgvector
    RAG->>Vector: searchSimilarChunks(documentId, queryVector, topK)
    Vector->>DB: SELECT chunks<br/>ORDER BY vector <=> queryVector<br/>LIMIT topK
    DB-->>Vector: Chunks com similarity scores
    Vector-->>RAG: SearchResult[]
    
    RAG->>RAG: filterBySimilarityThreshold(results, 0.3)
    
    alt Re-ranking habilitado
        RAG->>RAG: rerankResults(results, query)
    end
    
    RAG->>RAG: formatContextForPrompt(chunks)
    RAG->>RAG: extractEvidence(chunks)
    
    RAG->>DB: INSERT QueryLog<br/>(query, results, latency)
    
    RAG-->>API: RetrievalResult {<br/>  chunks: [...],<br/>  context: "...",<br/>  latency: 156<br/>}
    
    API-->>UI: {<br/>  chunks: [...],<br/>  scores: [0.87, 0.82, ...],<br/>  latency: 156<br/>}
    
    UI-->>User: Exibe chunks recuperados<br/>com scores de similaridade
```

## 5. Fluxo de Exportação de Questões

```mermaid
sequenceDiagram
    actor User as Usuário
    participant UI as Interface Web
    participant API as QuestionController
    participant Export as ExportService
    participant DB as PostgreSQL

    User->>UI: Seleciona questões e formato
    User->>UI: Clica em "Exportar"
    
    UI->>API: POST /api/export<br/>{questionIds, format: "json"}
    
    API->>DB: SELECT Questions<br/>WHERE id IN (questionIds)
    DB-->>API: Question[]
    
    API->>Export: exportToJSON(questions)
    
    alt Formato JSON
        Export->>Export: formatQuestionsAsJSON(questions)
        Export-->>API: JSON string
    else Formato CSV
        Export->>Export: formatQuestionsAsCSV(questions)
        Export-->>API: CSV string
    end
    
    API-->>UI: Response {<br/>  Content-Type: application/json,<br/>  Content-Disposition: attachment<br/>}
    
    UI-->>User: Inicia download do arquivo
```

## 6. Fluxo de Feedback de Questões

```mermaid
sequenceDiagram
    actor User as Usuário
    participant UI as Interface Web
    participant API as FeedbackController
    participant Analysis as FeedbackAnalyzer
    participant DB as PostgreSQL

    User->>UI: Avalia questão (👍 ou 👎)
    
    alt Feedback Negativo
        UI->>User: Modal: "Por que não gostou?"
        User->>UI: Seleciona razões
    end
    
    UI->>API: POST /api/feedback<br/>{questionId, rating, reasons, comment}
    
    API->>DB: INSERT QuestionFeedback
    
    Note over API,Analysis: Análise de padrões
    API->>Analysis: analyzeFeedbackPatterns(documentId)
    Analysis->>DB: SELECT Feedbacks<br/>WHERE rating = DISLIKE<br/>AND documentId = ...
    DB-->>Analysis: NegativeFeedback[]
    
    Analysis->>Analysis: groupByReason(feedbacks)
    Analysis->>Analysis: calculateFrequency(reasons)
    Analysis-->>API: {<br/>  mostCommonReasons: [...],<br/>  totalNegative: 5<br/>}
    
    API->>DB: UPDATE document metadata<br/>(feedback patterns)
    
    API-->>UI: {success: true}
    UI-->>User: "Obrigado pelo feedback!"
    
    Note over DB: Feedbacks serão usados<br/>na próxima geração para<br/>melhorar qualidade
```

## Notas Importantes

### Performance
- Processamento de documentos é **assíncrono**
- Embeddings são gerados em **batch**
- Cache de embeddings por modelo/provedor
- Índices pgvector para busca rápida

### Segurança
- Todas as requisições autenticadas por session token
- Validação de ownership (userId) em todas operações
- Rate limiting em APIs de IA
- Sanitização de inputs

### Escalabilidade
- Uso de Server Components do Next.js
- Streaming de respostas quando possível
- Paginação de resultados
- Connection pooling no PostgreSQL

### Resiliência
- Retry automático em chamadas de IA (max 3 tentativas)
- Fallback entre provedores de IA
- Tratamento de erros em todas camadas
- Logs detalhados para debugging

---

**Projeto Acadêmico - TCC**  
Questioning Agent | UNIP 2025
