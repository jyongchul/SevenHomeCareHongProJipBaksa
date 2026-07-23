#!/usr/bin/env python3
from __future__ import annotations

import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sync_naver_blog_full_posts import infer_category, infer_tags


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


if __name__ == "__main__":
    unittest.main()
