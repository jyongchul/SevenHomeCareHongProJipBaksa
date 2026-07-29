#!/usr/bin/env python3
from __future__ import annotations

import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sync_naver_blog_full_posts import (
    infer_category,
    infer_tags,
    is_explanatory_guide,
    render_elements,
)


class CategoryInferenceTests(unittest.TestCase):
    def category_for(self, title: str) -> str:
        tags = infer_tags(title)
        return infer_category(title, tags)

    def test_floor_sheet_repair_is_not_wallpaper_repair(self) -> None:
        title = "안양 강화마루 물먹음 부풀음, 손상부 제거 후 시트지 복원 사례"
        self.assertEqual(self.category_for(title), "바닥보수")
        self.assertNotIn("벽지보수", infer_tags(title))

    def test_floor_dragging_door_remains_door_repair(self) -> None:
        title = "부평 슬라이딩 도어 수리, 문이 바닥에 끌리는 현관 중문"
        self.assertEqual(self.category_for(title), "중문수리")

    def test_wallpaper_repair_remains_wallpaper_repair(self) -> None:
        self.assertEqual(self.category_for("찢어진 실크벽지 부분 복원"), "벽지보수")

    def test_floor_tag_takes_precedence_over_legacy_wallpaper_tag(self) -> None:
        title = "강마루 시트지 부분 보수"
        self.assertEqual(infer_category(title, ["바닥보수", "벽지보수"]), "바닥보수")


class ExplanatoryGuideTests(unittest.TestCase):
    def setUp(self) -> None:
        self.post = {
            "title": "집수리 시작 전 보양 범위 체크리스트",
            "url": "https://blog.naver.com/cadzone77/1",
            "category": "생활보수",
            "excerpt": "집수리 전 보양 범위를 정리한 안내입니다.",
            "elements": [
                {
                    "type": "text",
                    "content": "이 글은 특정 현장 시공 사례가 아니라 일반 점검 기준입니다.",
                },
                {
                    "type": "image",
                    "src": "https://example.com/checklist.png",
                    "alt": "보양 체크리스트",
                    "caption": "작업 이해를 돕는 설명 이미지: 바닥과 가구 보호",
                },
            ],
        }

    def test_detects_non_case_guide(self) -> None:
        self.assertTrue(is_explanatory_guide(self.post))

    def test_guide_omits_case_only_blocks_and_labels(self) -> None:
        rendered = render_elements(self.post)
        self.assertNotIn("이번 작업의 확인 포인트", rendered)
        self.assertNotIn("service-home-hardware.webp", rendered)
        self.assertNotIn("현장 사진", rendered)
        self.assertIn("설명 이미지 1/1", rendered)


if __name__ == "__main__":
    unittest.main()
