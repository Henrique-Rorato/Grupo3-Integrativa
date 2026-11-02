# Levantamento de necessidades de computador

MVP estático para levantar a necessidade de uso, comparar alguns requisitos de software com documentação publicada, sinalizar lacunas e preparar um rascunho editável de ETP.

## Fluxo

1. A tela inicial explica o fluxo e permite iniciar, continuar ou substituir um rascunho local.
2. A pessoa informa trabalho, programas e atividades, e a configuração proposta.
3. A etapa de comparação apresenta status por componente e por programa, relação com o uso declarado, fonte, data e pesquisa/justificativa pendente.
4. A etapa final cria um rascunho técnico com premissas, referências, itens a confirmar e campos estruturados para revisão. O texto fica editável e pode ser baixado como `.txt`.

## Referências e limites da comparação

O catálogo inicial contém requisitos mínimos Windows publicados pela Microsoft para Microsoft 365 empresarial/educacional/governamental, Office LTSC 2024 e Office LTSC 2021. As fontes oficiais e a data de consulta ficam em `reference-data.js`. Para Microsoft 365, confirme o SKU/plano; nomes de edições domésticas são excluídos da correspondência automática. A comparação automatiza apenas valores explicitamente mensuráveis: frequência/núcleos quando declarados, RAM, espaço livre informado, sistema operacional, resolução de tela e DirectX quando a documentação e a proposta permitem comparação direta.

Para outro programa ou versão, use “Adicionar referência oficial”, transcreva os mínimos da documentação e confira a fonte. Referências cadastradas pela pessoa são guardadas no navegador e não são verificadas pelo sistema. Programas sem fonte compatível recebem “Sem dados suficientes”; o sistema não deduz requisitos de nomes comerciais, benchmarks, marcas ou programas semelhantes.

“Adequado” significa que os dados declarados atendem ao mínimo comparado; “Acima da referência” quer dizer apenas que excedem esse mínimo, não que haja desperdício. A capacidade total do SSD não substitui a estimativa de espaço livre. Compatibilidade do modelo/driver, carga real, operação simultânea, garantia, desempenho prático, disponibilidade, preço e competitividade não são determinados por essa comparação. Requisitos mínimos do fabricante não são uma recomendação de compra.

## Rascunho de ETP

O rascunho segue uma estrutura de apoio baseada nos elementos da IN SEGES nº 58/2022. A própria norma define seu âmbito de aplicação; confirme a regulamentação do órgão, alterações posteriores e legislação local. O texto contém campos explícitos para pesquisa de mercado, preços, PCA, quantidades, sustentabilidade e conclusão, que não são preenchidos automaticamente nem inventados.

O resultado não é um documento oficial, aprovação ou parecer técnico/jurídico. A pessoa/equipe responsável deve validar fontes e premissas, pesquisar mercado e editar o documento antes de utilizá-lo.

## Privacidade

Não há dependências ou servidor. Levantamentos e referências customizadas são salvos em `localStorage` no próprio navegador e não são enviados a um backend. Evite inserir dados pessoais ou informações sigilosas. A limpeza de dados do navegador também remove esses rascunhos.
