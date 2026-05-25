import os

from pdf_extractor import extract_text_from_pdf
from keyword_analyzer import KeywordAnalyzer
from ranking_engine import RankingEngine


def main():

    # Caminho da pasta assets
    assets_path = "../../assets"

    analyzer = KeywordAnalyzer()

    candidates_dataset = []

    # Percorre todos os arquivos da pasta
    for file_name in os.listdir(assets_path):

        # Processa apenas PDFs
        if file_name.endswith(".pdf"):

            pdf_path = os.path.join(assets_path, file_name)

            print(f"\nProcessando: {file_name}")

            extracted_text = extract_text_from_pdf(pdf_path)

            if not extracted_text:
                print(f"Erro ao processar {file_name}")
                continue

            cleaned_text = analyzer.clean_text(extracted_text)

            analysis_result = analyzer.count_keywords(cleaned_text)

            ranking_result = RankingEngine.generate_ranking(
                analysis_result
            )

            candidate_data = {
                "file_name": file_name,
                "analysis": ranking_result
            }

            candidates_dataset.append(candidate_data)

    # Ordena ranking
    candidates_dataset.sort(
        key=lambda x: x["analysis"]["final_score"],
        reverse=True
    )

    print("\n========== RANKING FINAL ==========\n")

    for position, candidate in enumerate(candidates_dataset, start=1):

        analysis = candidate["analysis"]

        print(f"{position}º Lugar")

        print(f"Arquivo: {candidate['file_name']}")

        print(f"Score: {analysis['final_score']}")

        print(f"Nível: {analysis['ranking_level']}")

        print("-" * 40)


if __name__ == "__main__":
    main()