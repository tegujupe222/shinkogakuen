-- 現在のフォーム設定を確認
SELECT field_key, field_label, field_group, field_order 
FROM form_settings 
ORDER BY field_group, field_order;

-- guardian1グループのフィールドを確認
SELECT field_key, field_label, field_group, field_order 
FROM form_settings 
WHERE field_group = 'guardian1' 
ORDER BY field_order;
