#!/usr/bin/env python3
"""
CVMA SPARQL Data Fetcher
Lädt alle CVMA-Daten vom NFDI4Culture SPARQL-Endpoint herunter
"""

import requests
import json
import time
from datetime import datetime
import os

class CVMADataFetcher:
    def __init__(self):
        self.endpoint = "https://nfdi4culture.de/sparql"
        self.batch_size = 5000  # Kleinere Batches für Stabilität
        self.wait_time = 2  # Sekunden zwischen Anfragen
        self.all_results = []
        self.output_file = f"cvma_complete_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
    def fetch_batch(self, offset):
        """Holt einen Batch von Daten"""
        query = f"""
        PREFIX nfdi4culture: <https://nfdi4culture.de/ontology#>
        
        SELECT ?item ?property ?value
        WHERE {{
          ?item nfdi4culture:elementOf <https://nfdi4culture.de/id/E5308> ;
                ?property ?value .
        }}
        LIMIT {self.batch_size}
        OFFSET {offset}
        """
        
        try:
            response = requests.get(
                self.endpoint,
                params={
                    'query': query,
                    'format': 'json'
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Fehler: HTTP {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Netzwerkfehler: {e}")
            return None
    
    def save_checkpoint(self, offset):
        """Speichert Zwischenstand"""
        checkpoint_file = f"checkpoint_{offset}.json"
        with open(checkpoint_file, 'w', encoding='utf-8') as f:
            json.dump({
                'offset': offset,
                'results_count': len(self.all_results),
                'timestamp': datetime.now().isoformat()
            }, f, indent=2)
        print(f"💾 Checkpoint gespeichert: {checkpoint_file}")
    
    def fetch_all_data(self):
        """Hauptfunktion zum Abrufen aller Daten"""
        print("=" * 60)
        print("CVMA SPARQL DATA FETCHER")
        print("=" * 60)
        print(f"Endpoint: {self.endpoint}")
        print(f"Batch-Größe: {self.batch_size}")
        print(f"Wartezeit zwischen Anfragen: {self.wait_time}s")
        print(f"Output-Datei: {self.output_file}")
        print("=" * 60)
        
        offset = 0
        batch_number = 1
        empty_batches = 0
        total_objects = set()
        
        while True:
            print(f"\n🔄 Batch #{batch_number} (Offset: {offset})")
            
            # Daten abrufen
            data = self.fetch_batch(offset)
            
            if data and 'results' in data and 'bindings' in data['results']:
                bindings = data['results']['bindings']
                
                if bindings:
                    # Füge neue Ergebnisse hinzu
                    self.all_results.extend(bindings)
                    
                    # Zähle eindeutige Objekte
                    for binding in bindings:
                        if 'item' in binding:
                            total_objects.add(binding['item']['value'])
                    
                    print(f"✅ {len(bindings)} Tripel abgerufen")
                    print(f"📊 Gesamt: {len(self.all_results)} Tripel")
                    print(f"📦 Eindeutige Objekte bisher: {len(total_objects)}")
                    
                    # Speichere Zwischenstand alle 10 Batches
                    if batch_number % 10 == 0:
                        self.save_intermediate_results()
                        self.save_checkpoint(offset)
                    
                    empty_batches = 0
                else:
                    empty_batches += 1
                    print("⚠️  Leerer Batch erhalten")
                    
                    if empty_batches >= 2:
                        print("\n✅ Alle Daten abgerufen!")
                        break
            else:
                print("❌ Fehler beim Abrufen der Daten")
                retry = input("Nochmal versuchen? (j/n): ")
                if retry.lower() != 'j':
                    break
                continue
            
            # Nächster Batch
            offset += self.batch_size
            batch_number += 1
            
            # Warte zwischen Anfragen
            print(f"⏳ Warte {self.wait_time} Sekunden...")
            time.sleep(self.wait_time)
            
            # Optional: Stoppe nach bestimmter Anzahl (für Tests)
            # if batch_number > 50:  # Zum Testen
            #     print("Test-Limit erreicht")
            #     break
        
        # Finale Speicherung
        self.save_final_results()
        self.print_summary(total_objects)
    
    def save_intermediate_results(self):
        """Speichert Zwischenergebnisse"""
        temp_file = f"temp_{self.output_file}"
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump({
                'meta': {
                    'timestamp': datetime.now().isoformat(),
                    'count': len(self.all_results),
                    'complete': False
                },
                'results': {
                    'bindings': self.all_results
                }
            }, f, ensure_ascii=False, indent=2)
        print(f"💾 Zwischenspeicherung: {temp_file}")
    
    def save_final_results(self):
        """Speichert finale Ergebnisse"""
        print("\n📝 Speichere finale Datei...")
        
        # Statistiken berechnen
        unique_objects = set()
        unique_properties = set()
        
        for binding in self.all_results:
            if 'item' in binding:
                unique_objects.add(binding['item']['value'])
            if 'property' in binding:
                unique_properties.add(binding['property']['value'])
        
        # Finale Datei speichern
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'meta': {
                    'description': 'Complete CVMA data from NFDI4Culture Knowledge Graph',
                    'source': self.endpoint,
                    'timestamp': datetime.now().isoformat(),
                    'total_triples': len(self.all_results),
                    'unique_objects': len(unique_objects),
                    'unique_properties': len(unique_properties),
                    'complete': True
                },
                'results': {
                    'bindings': self.all_results
                }
            }, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Datei gespeichert: {self.output_file}")
        print(f"📊 Dateigröße: {os.path.getsize(self.output_file) / 1024 / 1024:.2f} MB")
    
    def print_summary(self, total_objects):
        """Gibt finale Zusammenfassung aus"""
        print("\n" + "=" * 60)
        print("ZUSAMMENFASSUNG")
        print("=" * 60)
        print(f"✅ Gesamt-Tripel abgerufen: {len(self.all_results):,}")
        print(f"📦 Eindeutige Objekte: {len(total_objects):,}")
        print(f"📁 Gespeichert in: {self.output_file}")
        
        if len(total_objects) < 8730:
            print(f"⚠️  Hinweis: Es wurden {len(total_objects)} von erwarteten 8.730 Objekten abgerufen")
            print("    Mögliche Gründe: Timeout, Netzwerkfehler oder Server-Limits")
        else:
            print("✅ Alle erwarteten Objekte wurden abgerufen!")
    
    def resume_from_checkpoint(self, checkpoint_file):
        """Setzt Download von Checkpoint fort"""
        with open(checkpoint_file, 'r') as f:
            checkpoint = json.load(f)
        
        print(f"📂 Lade Checkpoint: Offset {checkpoint['offset']}")
        # Hier würde man die vorherigen Ergebnisse laden
        # und ab dem Offset fortfahren

def main():
    fetcher = CVMADataFetcher()
    
    print("CVMA Daten-Download")
    print("Dieser Vorgang kann 15-30 Minuten dauern")
    
    start = input("\nDownload starten? (j/n): ")
    if start.lower() == 'j':
        start_time = time.time()
        fetcher.fetch_all_data()
        elapsed = time.time() - start_time
        print(f"\n⏱️  Gesamtdauer: {elapsed/60:.2f} Minuten")
    else:
        print("Abgebrochen")

if __name__ == "__main__":
    main()