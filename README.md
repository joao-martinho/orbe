# Orbe: um sistema de gerenciamento da disciplina TCC I no DSC da FURB

Este repositório contém o código do Orbe, um sistema de gerenciamento de TCCs que eu desenvolvi durante o ano de 2025 como o meu trabalho de conclusão do curso de Ciência da Computação na FURB, sob a orientação do [@dalton-reis](https://github.com/dalton-reis). O Orbe foi projetado para ajudar os professores e alunos do departamento a lidar com a comunicação e a troca de documentos exigidas pela disciplina TCC I.

## A _stack_ escolhida

- Servidor (_back-end_): Spring Boot. A minha implementação usa quatro camadas: modelo, para estruturas de dados; controle, para funções CRUD; serviço, para regras de negócio; e repositório, para chamadas ao banco de dados;  
- Cliente (_front-end_): HTML e JavaScript simples. As páginas são geradas estaticamente e as entradas do usuário disparam chamadas ao servidor. O CSS foi emprestado do Bootstrap;  
- Banco de dados: MariaDB, uma escolha simples, sólida e com licença livre, perfeita para pequenos projetos como o Orbe.

## Diagrama MER

Abaixo está o modelo entidade-relacionamento do Orbe, renderizado pela ferramenta Mermaid.

```mermaid
classDiagram

    class AdminModelo {
        -String email
        -String senha
        +setSenhaEmTexto(String)
        +conferirSenha(String): boolean
    }

    class AlunoModelo {
        -String email
        -String nome
        -String telefone
        -String senha
        -String curso
        -String orientadorProvisorio
        -String orientador
        -String coorientadorProvisorio
        -String coorientador
        -String codigoVer
        -LocalDateTime criadoEm
        +setSenhaEmTexto(String)
        +conferirSenha(String): boolean
    }

    class ProfessorModelo {
        -String email
        -String nome
        -String telefone
        -List~String~ orientandosProvisorios
        -List~String~ orientandos
        -List~String~ coorientandosProvisorios
        -List~String~ coorientandos
        -String senha
        -String codigoVer
        -LocalDateTime criadoEm
        -Set~PapelProfessor~ papeis
        +setSenhaEmTexto(String)
        +conferirSenha(String): boolean
    }

    class PapelProfessor {
        <<enumeration>>
        PROF_TCC1
        PROF_TCC2
        COORD_BCC
        COORD_SIS
    }

    class TermoModelo {
        -Long id
        -String titulo
        -String emailAluno
        -String telefoneAluno
        -String nomeAluno
        -String cursoAluno
        -String emailOrientador
        -String emailCoorientador
        -String perfilCoorientador
        -String ano
        -String semestre
        -String resumo
        -LocalDateTime criadoEm
        -String status
        -String comentario
    }

    class BancaModelo {
        -Long id
        -String emailAluno
        -String emailOrientador
        -String emailCoorientador
        -String curso
        -String titulo
        -String resumo
        -String emailProfessor1
        -String emailProfessor2
        -String emailProfessor3
        -boolean marcada
        -LocalDate data
        -LocalTime hora
        -Float nota1
        -Float nota2
        -Float nota3
        -Float mediaFinal
        -String status
    }

    class EntregaModelo {
        -Long id
        -String titulo
        -String emailAutor
        -String emailOrientador
        -String emailCoorientador
        -String nomeArquivo
        -String arquivoBase64
        -LocalDateTime criadoEm
    }

    class RevisaoModelo {
        -Long id
        -String titulo
        -String emailAutor
        -String emailAluno
        -String nomeArquivo
        -String arquivoBase64
        -LocalDateTime criadoEm
    }

    class DocumentoModelo {
        -Long id
        -String titulo
        -String emailAutor
        -String emailAluno
        -String nomeArquivo
        -String arquivoBase64
        -LocalDateTime criadoEm
        -boolean profTcc1
    }

    %% Relacionamentos (via e-mails)
    AlunoModelo --> ProfessorModelo : orientadorProvisorio
    AlunoModelo --> ProfessorModelo : orientador
    AlunoModelo --> ProfessorModelo : coorientadorProvisorio
    AlunoModelo --> ProfessorModelo : coorientador
    ProfessorModelo "1" --> "*" PapelProfessor : papeis
    TermoModelo --> AlunoModelo : emailAluno
    TermoModelo --> ProfessorModelo : emailOrientador
    TermoModelo --> ProfessorModelo : emailCoorientador
    BancaModelo --> AlunoModelo : emailAluno
    BancaModelo --> ProfessorModelo : orientador/coorientador
    BancaModelo --> ProfessorModelo : membros (prof1, prof2, prof3)
    EntregaModelo --> AlunoModelo : emailAutor
    EntregaModelo --> ProfessorModelo : orientador/coorientador
    RevisaoModelo --> ProfessorModelo : emailAutor
    RevisaoModelo --> AlunoModelo : emailAluno
    DocumentoModelo --> ProfessorModelo : emailAutor
    DocumentoModelo --> AlunoModelo : emailAluno

```
