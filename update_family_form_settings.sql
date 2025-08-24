-- 既存のguardian1グループのフィールドをfamilyグループに更新
UPDATE form_settings 
SET field_group = 'family', 
    updated_at = NOW()
WHERE field_group = 'guardian1';

-- 新しい家族情報フィールドを追加
INSERT INTO form_settings (field_key, field_label, field_type, field_group, field_order, is_required, options, created_at, updated_at) VALUES
-- 保護者2情報
('guardian2_last_name', '保護者２名前(姓)', 'text', 'family', 17, false, null, NOW(), NOW()),
('guardian2_first_name', '保護者２名前(名)', 'text', 'family', 18, false, null, NOW(), NOW()),
('guardian2_last_name_kana', '保護者２名前(ふりがな)(姓)', 'text', 'family', 19, false, null, NOW(), NOW()),
('guardian2_first_name_kana', '保護者２名前(ふりがな)(名)', 'text', 'family', 20, false, null, NOW(), NOW()),
('guardian2_postal_code', '保護者２現在住所(郵便番号)', 'text', 'family', 21, false, null, NOW(), NOW()),
('guardian2_address', '保護者２現在住所', 'text', 'family', 22, false, null, NOW(), NOW()),
('guardian2_address_detail', '保護者２現在住所(番地・部屋番号)', 'text', 'family', 23, false, null, NOW(), NOW()),
('guardian2_phone', '保護者２電話番号', 'tel', 'family', 24, false, null, NOW(), NOW()),
('guardian2_relationship', '保護者２と生徒本人との関係', 'select', 'family', 25, false, '父,母,祖父,祖母,その他', NOW(), NOW()),
('guardian2_relationship_other', '保護者２と生徒本人との関係(その他の場合)', 'text', 'family', 26, false, null, NOW(), NOW()),
('guardian2_email', '保護者２メールアドレス', 'email', 'family', 27, false, null, NOW(), NOW()),

-- 書類送付先
('document_recipient_last_name', '書類の送付先(姓)', 'text', 'family', 28, false, null, NOW(), NOW()),
('document_recipient_first_name', '書類の送付先(名)', 'text', 'family', 29, false, null, NOW(), NOW()),
('document_recipient_postal_code', '書類の送付先 住所(郵便番号)', 'text', 'family', 30, false, null, NOW(), NOW()),
('document_recipient_address', '書類の送付先 住所', 'text', 'family', 31, false, null, NOW(), NOW()),
('document_recipient_address_detail', '書類の送付先 住所(番地・部屋番号)', 'text', 'family', 32, false, null, NOW(), NOW()),

-- 緊急連絡先1
('emergency1_last_name', '緊急連絡先１(姓)', 'text', 'family', 33, false, null, NOW(), NOW()),
('emergency1_first_name', '緊急連絡先１(名)', 'text', 'family', 34, false, null, NOW(), NOW()),
('emergency1_phone', '緊急連絡先１(電話番号)', 'tel', 'family', 35, false, null, NOW(), NOW()),
('emergency1_relationship', '緊急連絡先１(生徒本人との関係)', 'select', 'family', 36, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()),
('emergency1_relationship_other', '緊急連絡先１と生徒本人との関係(その他の場合)', 'text', 'family', 37, false, null, NOW(), NOW()),

-- 緊急連絡先2
('emergency2_last_name', '緊急連絡先２(姓)', 'text', 'family', 38, false, null, NOW(), NOW()),
('emergency2_first_name', '緊急連絡先２(名)', 'text', 'family', 39, false, null, NOW(), NOW()),
('emergency2_phone', '緊急連絡先２(電話番号)', 'tel', 'family', 40, false, null, NOW(), NOW()),
('emergency2_relationship', '緊急連絡先２(生徒本人との関係)', 'select', 'family', 41, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()),
('emergency2_relationship_other', '緊急連絡先２と生徒本人との関係(その他の場合)', 'text', 'family', 42, false, null, NOW(), NOW()),

-- 兄弟姉妹情報
('has_siblings_at_school', '本校在籍の兄弟姉妹の有無', 'select', 'family', 43, false, 'あり,なし', NOW(), NOW()),

-- 家族1情報
('family1_last_name', '家族１名前(姓)', 'text', 'family', 44, false, null, NOW(), NOW()),
('family1_first_name', '家族１名前(名)', 'text', 'family', 45, false, null, NOW(), NOW()),
('family1_relationship', '家族１と生徒本人との関係', 'select', 'family', 46, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()),
('family1_relationship_other', '家族１と生徒本人との関係(その他の場合)', 'text', 'family', 47, false, null, NOW(), NOW()),
('family1_birth_date', '家族１(生年月日)', 'date', 'family', 48, false, null, NOW(), NOW()),
('family1_living_status', '家族１(同居/別居)', 'select', 'family', 49, false, '同居,別居', NOW(), NOW()),
('family1_workplace_school', '家族１(勤務先または学校名)', 'text', 'family', 50, false, null, NOW(), NOW()),

-- 家族2情報
('family2_last_name', '家族２名前(姓)', 'text', 'family', 51, false, null, NOW(), NOW()),
('family2_first_name', '家族２名前(名)', 'text', 'family', 52, false, null, NOW(), NOW()),
('family2_relationship', '家族２と生徒本人との関係', 'select', 'family', 53, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()),
('family2_relationship_other', '家族２と生徒本人との関係(その他の場合)', 'text', 'family', 54, false, null, NOW(), NOW()),
('family2_birth_date', '家族２(生年月日)', 'date', 'family', 55, false, null, NOW(), NOW()),
('family2_living_status', '家族２(同居/別居)', 'select', 'family', 56, false, '同居,別居', NOW(), NOW()),
('family2_workplace_school', '家族２(勤務先または学校名)', 'text', 'family', 57, false, null, NOW(), NOW()),

-- 家族3情報
('family3_last_name', '家族３名前(姓)', 'text', 'family', 58, false, null, NOW(), NOW()),
('family3_first_name', '家族３名前(名)', 'text', 'family', 59, false, null, NOW(), NOW()),
('family3_relationship', '家族３と生徒本人との関係', 'select', 'family', 60, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()),
('family3_relationship_other', '家族３と生徒本人との関係(その他の場合)', 'text', 'family', 61, false, null, NOW(), NOW()),
('family3_birth_date', '家族３(生年月日)', 'date', 'family', 62, false, null, NOW(), NOW()),
('family3_living_status', '家族３(同居/別居)', 'select', 'family', 63, false, '同居,別居', NOW(), NOW()),
('family3_workplace_school', '家族３(勤務先または学校名)', 'text', 'family', 64, false, null, NOW(), NOW()),

-- 家族4情報
('family4_last_name', '家族４名前(姓)', 'text', 'family', 65, false, null, NOW(), NOW()),
('family4_first_name', '家族４名前(名)', 'text', 'family', 66, false, null, NOW(), NOW()),
('family4_relationship', '家族４と生徒本人との関係', 'select', 'family', 67, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()),
('family4_relationship_other', '家族４と生徒本人との関係(その他の場合)', 'text', 'family', 68, false, null, NOW(), NOW()),
('family4_birth_date', '家族４(生年月日)', 'date', 'family', 69, false, null, NOW(), NOW()),
('family4_living_status', '家族４(同居/別居)', 'select', 'family', 70, false, '同居,別居', NOW(), NOW()),
('family4_workplace_school', '家族４(勤務先または学校名)', 'text', 'family', 71, false, null, NOW(), NOW()),

-- 家族5情報
('family5_last_name', '家族５名前(姓)', 'text', 'family', 72, false, null, NOW(), NOW()),
('family5_first_name', '家族５名前(名)', 'text', 'family', 73, false, null, NOW(), NOW()),
('family5_relationship', '家族５と生徒本人との関係', 'select', 'family', 74, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()),
('family5_relationship_other', '家族５と生徒本人との関係(その他の場合)', 'text', 'family', 75, false, null, NOW(), NOW()),
('family5_birth_date', '家族５(生年月日)', 'date', 'family', 76, false, null, NOW(), NOW()),
('family5_living_status', '家族５(同居/別居)', 'select', 'family', 77, false, '同居,別居', NOW(), NOW()),
('family5_workplace_school', '家族５(勤務先または学校名)', 'text', 'family', 78, false, null, NOW(), NOW()),

-- 家族6情報
('family6_last_name', '家族６名前(姓)', 'text', 'family', 79, false, null, NOW(), NOW()),
('family6_first_name', '家族６名前(名)', 'text', 'family', 80, false, null, NOW(), NOW()),
('family6_relationship', '家族６と生徒本人との関係', 'select', 'family', 81, false, '父,母,祖父,祖母,兄弟,姉妹,その他', NOW(), NOW()),
('family6_relationship_other', '家族６と生徒本人との関係(その他の場合)', 'text', 'family', 82, false, null, NOW(), NOW()),
('family6_birth_date', '家族６(生年月日)', 'date', 'family', 83, false, null, NOW(), NOW()),
('family6_living_status', '家族６(同居/別居)', 'select', 'family', 84, false, '同居,別居', NOW(), NOW()),
('family6_workplace_school', '家族６(勤務先または学校名)', 'text', 'family', 85, false, null, NOW(), NOW())
ON CONFLICT (field_key) DO UPDATE SET
    field_label = EXCLUDED.field_label,
    field_type = EXCLUDED.field_type,
    field_group = EXCLUDED.field_group,
    field_order = EXCLUDED.field_order,
    is_required = EXCLUDED.is_required,
    options = EXCLUDED.options,
    updated_at = NOW();

-- 更新結果を確認
SELECT field_key, field_label, field_group, field_order 
FROM form_settings 
WHERE field_group = 'family' 
ORDER BY field_order;
