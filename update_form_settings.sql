-- 既存のguardian1グループのフィールドをfamilyグループに更新
UPDATE form_settings 
SET field_group = 'family', 
    updated_at = NOW()
WHERE field_group = 'guardian1';

-- 更新結果を確認
SELECT field_key, field_label, field_group, field_order 
FROM form_settings 
WHERE field_group = 'family' 
ORDER BY field_order;
