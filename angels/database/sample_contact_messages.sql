USE angels_ecommerce;
GO

-- Insert sample contact messages
INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES
('Ahmed Mohamed', 'ahmed.mohamed@email.com', 'Product Inquiry', 'Hi, I was wondering if you have the Classic White T-Shirt in size XXL? I really like the design and would love to purchase it.', 0),
('Sara Ahmed', 'sara.ahmed@email.com', 'Order Status', 'Hello, I placed an order for the Blue Denim Jeans last week. Could you please update me on the shipping status? Order number: #12345', 0),
('Mohamed Ali', 'mohamed.ali@email.com', 'Return Request', 'I received the Summer Dress I ordered but it doesn''t fit well. I would like to return it and get a refund. Please let me know the return process.', 1),
('Fatima Hassan', 'fatima.hassan@email.com', 'Size Guide Question', 'Can you please provide more detailed size measurements for the Leather Jacket? I want to make sure I get the right size.', 0),
('Omar Khaled', 'omar.khaled@email.com', 'Complaint', 'I am disappointed with the quality of the Sneakers I received. The stitching came apart after wearing them only twice. I expect a full refund.', 1),
('Laila Mahmoud', 'laila.mahmoud@email.com', 'Custom Order', 'I love your Graphic Tee designs! Would it be possible to create a custom design for a family reunion? Please let me know the process and pricing.', 0);
