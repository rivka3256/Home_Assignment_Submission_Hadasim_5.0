
/*CREATE DATABASE family;
USE family;*/
CREATE TABLE Persons (
    Person_Id INT PRIMARY KEY,
    Personal_Name NVARCHAR(25),
    Family_Name NVARCHAR(25),
    Gender CHAR(10),
    Father_Id INT NULL,
    Mother_Id INT NULL,
    Spouse_Id INT NULL
);


INSERT INTO Persons (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id, Spouse_Id) VALUES
-- משפחה 1: משפחת מסיקה
(1, N'יוסף', N'מסיקה', 'Male', NULL, NULL, 2),     
(2, N'אסתר', N'מסיקה', 'Female', NULL, 1, NULL),
(3, N'משה', N'מסיקה', 'Male', 1, 2, 7), -- נשוי ל-7 (ממשפחת סוויד)
(4, N'שירה', N'מסיקה', 'Female', 1, 2, NULL),
(5, N'עדן', N'מסיקה', 'Female', 1, 2, NULL),

-- משפחה 2: משפחת סוויד
(6, N'אליהו', N'סוויד', 'Male', NULL, NULL, NULL),
(7, N'רינה', N'סוויד', 'Female', 6, NULL, 3),  -- נשואה ל-3 (ממשפחת מסיקה)
(8, N'משה', N'סוויד', 'Male', 6, NULL, NULL),   
(9, N'הודיה', N'סוויד', 'Female', 6, NULL, NULL),
(10, N'תהילה', N'סוויד', 'Female', 6, NULL, NULL) ;

CREATE TABLE FamilyTree (
    Person_Id INT,        
    Relative_Id INT,       
    Connection_Type NVARCHAR(20), 
    PRIMARY KEY (Person_Id, Relative_Id),
    FOREIGN KEY (Person_Id) REFERENCES Persons(Person_Id),  
    FOREIGN KEY (Relative_Id) REFERENCES Persons(Person_Id)  
);

INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
-- Add father-child connections
SELECT Person_Id, Father_ID, 'Father' 
FROM Persons 
WHERE Father_ID IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM FamilyTree 
    WHERE Person_Id = Persons.Person_Id 
    AND Relative_Id = Persons.Father_ID 
)
UNION ALL
-- Add mother-child connections
SELECT Person_Id, Mother_ID, 'Mother' 
FROM Persons 
WHERE Mother_ID IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM FamilyTree 
    WHERE Person_Id = Persons.Person_Id 
    AND Relative_Id = Persons.Mother_ID 
)

UNION ALL
-- Add spouse connections
SELECT S1.Person_Id, S2.Person_Id, 
    CASE 
        WHEN S1.Gender = 'Male' THEN 'Husband' 
        ELSE 'Wife' 
    END
FROM Persons S1
JOIN Persons S2 ON S1.Spouse_ID = S2.Person_Id
WHERE S1.Spouse_ID IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM FamilyTree 
    WHERE Person_Id = S1.Person_Id 
    AND Relative_Id = S2.Person_Id 
)

UNION ALL
-- Add sibling connections
SELECT C1.Person_Id, C2.Person_Id, 
    CASE 
        WHEN C1.Gender = 'Male' THEN 'Brother' 
        ELSE 'Sister' 
    END AS Connection_Type
FROM Persons C1
JOIN Persons C2 
    ON C1.Person_Id <> C2.Person_Id 
    AND (C1.Father_ID = C2.Father_ID OR C1.Mother_ID = C2.Mother_ID)
WHERE NOT EXISTS (
    SELECT 1 FROM FamilyTree 
    WHERE Person_Id = C1.Person_Id 
    AND Relative_Id = C2.Person_Id 
)

UNION ALL
-- Add child-to-parent connections
SELECT P.Person_Id, C.Person_Id, 
    CASE 
        WHEN C.Gender = 'Male' THEN 'Son' 
        ELSE 'Daughter' 
    END
FROM Persons P
JOIN Persons C ON P.Person_Id = C.Father_ID OR P.Person_Id = C.Mother_ID
WHERE NOT EXISTS (
    SELECT 1 FROM FamilyTree 
    WHERE Person_Id = P.Person_Id 
    AND Relative_Id = C.Person_Id 
);


-- Exercise 2
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT P1.Person_Id, P2.Person_Id, 
       CASE WHEN P1.Gender = 'Male' THEN 'Husband' ELSE 'Wife' END
FROM Persons P1
JOIN Persons P2 ON P1.Spouse_ID = P2.Person_Id
UNION ALL
SELECT P2.Person_Id, P1.Person_Id, 
       CASE WHEN P2.Gender = 'Male' THEN 'Husband' ELSE 'Wife' END
FROM Persons P1
JOIN Persons P2 ON P1.Spouse_ID = P2.Person_Id
WHERE NOT EXISTS (
    SELECT 1 FROM FamilyTree FamTree
    WHERE FamTree.Person_Id = P2.Person_Id AND FamTree.Relative_Id = P1.Person_Id
);


